// Local administrator CLI. Never expose this script through an HTTP route.
require('dotenv').config({path:require('node:path').join(__dirname,'.env')});
const jwt = require('jsonwebtoken');
const db = require('./db');
async function main() {
  const [command,value] = process.argv.slice(2);
  if (!['create','token'].includes(command) || !value) {
    console.log('Usage: node provider-admin.js create "Provider name" | token PROVIDER_ID');
    return;
  }
  if (command === 'create') {
    if (!value.trim() || value.length > 100) throw new Error('Name must be 1-100 characters.');
    const [result] = await db.execute('INSERT INTO handymen (name) VALUES (?)',[value.trim()]);
    console.log('Created handyman ID: '+result.insertId);
    return;
  }
  if (!/^[1-9]\d*$/.test(value) || Number(value)>2147483647) throw new Error('Invalid ID.');
  const [rows] = await db.execute('SELECT id FROM handymen WHERE id=?',[value]);
  if (!rows.length) throw new Error('Handyman not found.');
  const secret = process.env.JWT_SECRET;
  if (!secret || Buffer.byteLength(secret)<32 || secret.startsWith('replace_')) throw new Error('Configure a random JWT_SECRET first.');
  console.log(jwt.sign({},secret,{algorithm:'HS256',subject:value,expiresIn:'1h',issuer:process.env.JWT_ISSUER||'moneymentor-local',audience:process.env.JWT_AUDIENCE||'moneymentor-api'}));
}
main().catch(error=>{console.error(error.code||error.message);process.exitCode=1;}).finally(()=>db.end());
