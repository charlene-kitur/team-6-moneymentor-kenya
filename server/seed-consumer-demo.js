// Explicit opt-in seed. Uses dedicated fictional providers; never replaces existing rows.
const path = require('node:path');
require('dotenv').config({path:path.join(__dirname,process.argv.includes('--demo')?'.env.demo':'.env'),override:process.argv.includes('--demo')});
const db = require('./db');
async function main() {
 const c = await db.getConnection();
 let locked = false;
 try {
  const [[lock]] = await c.query("SELECT GET_LOCK('moneymentor_consumer_seed_v1',10) AS acquired");
  if (Number(lock.acquired)!==1) throw new Error('Another seed is running. Try later.');
  locked=true;
  await c.beginTransaction();
  const samples=[
   {name:'Sample: Amani Plumbing',income:45000,expense:6500,goal:60000,saved:24000},
   {name:'Sample: Baraka Electrical',income:62000,expense:8500,goal:100000,saved:35000}
  ];
  const report=[];
  for(const s of samples){
   const [existing]=await c.execute('SELECT id FROM handymen WHERE name=?',[s.name]);
   if(existing.length){report.push({name:s.name,id:existing[0].id,status:'existing sample preserved'});continue;}
   const [r]=await c.execute('INSERT INTO handymen(name) VALUES (?)',[s.name]);
   const id=r.insertId;
   await c.execute('INSERT INTO provider_income(handyman_id,amount,income_date) VALUES (?,?,?)',[id,s.income,'2026-10-01']);
   await c.execute('INSERT INTO provider_expenses(handyman_id,description,category,amount,expense_date) VALUES (?,?,?,?,?)',[id,'Sample: tools and transport','Business',s.expense,'2026-10-02']);
   await c.execute('INSERT INTO provider_savings_goals(handyman_id,goal_amount,current_amount) VALUES (?,?,?)',[id,s.goal,s.saved]);
   await c.execute('INSERT INTO provider_investments(handyman_id,initial_amount,monthly_contribution,annual_rate,years) VALUES (?,?,?,?,?)',[id,10000,2000,8,3]);
   report.push({name:s.name,id,status:'created',month:'2026-10',income:s.income,expenses:s.expense,net:s.income-s.expense});
  }
  await c.commit();
  console.log(JSON.stringify(report,null,2));
 } catch(e){await c.rollback();throw e;}
 finally{if(locked) await c.query("SELECT RELEASE_LOCK('moneymentor_consumer_seed_v1')");c.release();await db.end();}
}
main().catch(e=>{console.error('Sample seed failed:',e.code||e.message);process.exitCode=1;});
