// Creates an isolated documentation database. Never overwrites existing data/config.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
async function main() {
  const configPath = path.join(__dirname, '.env.demo');
  if (fs.existsSync(configPath)) throw new Error('.env.demo already exists. Use npm run start:demo; setup is only run once.');
  const flag = process.argv.indexOf('--admin-env');
  const adminPath = flag < 0 ? path.join(__dirname,'.env.admin') : process.argv[flag+1];
  if (!adminPath || !fs.existsSync(adminPath)) throw new Error('Create server/.env.admin using the root README instructions first.');
  const admin = dotenv.parse(fs.readFileSync(adminPath));
  const host=admin.DB_HOST||'127.0.0.1', port=Number(admin.DB_PORT||3306);
  const database='moneymentor_week8_demo';
  const user='mm_demo_'+crypto.randomBytes(5).toString('hex');
  const password=crypto.randomBytes(32).toString('hex');
  const connection=await mysql.createConnection({host,port,user:admin.DB_USER,password:admin.DB_PASSWORD});
  try {
    const [exists]=await connection.execute('SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME=?',[database]);
    if (exists.length) throw new Error('moneymentor_week8_demo already exists. Refusing to overwrite it. See README troubleshooting.');
    await connection.query('CREATE DATABASE '+mysql.escapeId(database));
    await connection.query('USE '+mysql.escapeId(database));
    for (const file of ['schema.sql','provider-schema.sql']) {
      for (const statement of fs.readFileSync(path.join(__dirname,file),'utf8').split(';').filter(s=>s.trim())) await connection.query(statement);
    }
    await connection.execute('INSERT INTO handymen (id,name) VALUES (1,?)',['Documentation demo provider']);
    await connection.execute('INSERT INTO provider_income (handyman_id,amount,income_date) VALUES (1,5000,?)',['2026-09-01']);
    await connection.execute('INSERT INTO provider_savings_goals (handyman_id,goal_amount,current_amount) VALUES (1,1000,450)');
    await connection.execute('INSERT INTO provider_investments (handyman_id,initial_amount,monthly_contribution,annual_rate,years) VALUES (1,1000,100,12,1)');
    for (const accountHost of ['localhost','127.0.0.1']) {
      const account=mysql.escape(user)+'@'+mysql.escape(accountHost);
      await connection.query('CREATE USER '+account+' IDENTIFIED BY '+mysql.escape(password));
      await connection.query('GRANT SELECT, INSERT, UPDATE, DELETE ON '+mysql.escapeId(database)+'.* TO '+account);
    }
    const values={DB_HOST:host,DB_PORT:port,DB_USER:user,DB_PASSWORD:password,DB_NAME:database,PORT:5001,CLIENT_ORIGIN:'http://localhost:3000',JWT_SECRET:crypto.randomBytes(48).toString('hex'),JWT_ISSUER:'moneymentor-local',JWT_AUDIENCE:'moneymentor-api'};
    fs.writeFileSync(configPath,Object.entries(values).map(([k,v])=>k+'='+JSON.stringify(String(v))).join('\n')+'\n',{flag:'wx'});
    console.log('Demo ready: provider 1, isolated database, API port 5001. Credentials saved privately in .env.demo.');
  } finally { await connection.end(); }
}
main().catch(error=>{console.error(error.code||error.message);process.exitCode=1;});
