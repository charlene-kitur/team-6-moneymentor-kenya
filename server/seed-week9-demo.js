// Add only fictional samples to the isolated demo database. Existing records are preserved.
require('dotenv').config({path:require('node:path').join(__dirname,'.env.demo'),override:true});
const db=require('./db');
async function main(){
 if(process.env.DB_NAME!=='moneymentor_week8_demo')throw new Error('Only isolated demo database supported');
 const c=await db.getConnection();
 try{await c.query("SELECT GET_LOCK('moneymentor-demo-seed',10)");await c.beginTransaction();
 const [[provider]]=await c.query('SELECT id FROM handymen WHERE id=1');if(!provider)await c.execute('INSERT INTO handymen (id,name) VALUES (1,?)',['Sample: HandyNear demonstration']);
 const configs=[
 ['expenses','',i=>['INSERT INTO expenses (description,category,amount,expense_date) VALUES (?,?,?,?)',[`Sample: Week 9 expense ${i}`,'Other',100+i*25,'2026-10-27']]],
 ['budgets','',i=>['INSERT INTO budgets (income,fixed,variable) VALUES (?,?,?)',[30000+i*1000,10000+i*100,5000+i*100]]],
 ['savings_goals','',i=>['INSERT INTO savings_goals (goal_amount,monthly_save) VALUES (?,?)',[10000+i*1000,1000+i*100]]],
 ['contact_questions','',i=>['INSERT INTO contact_questions (name,email,question) VALUES (?,?,?)',[`Sample user ${i}`,`sample${i}@example.com`,'Sample: How can I plan monthly savings?']]],
 ['provider_expenses',' WHERE handyman_id=1',i=>['INSERT INTO provider_expenses (handyman_id,description,category,amount,expense_date) VALUES (1,?,?,?,?)',[`Sample: Provider expense ${i}`,'Other',200+i*30,'2026-10-27']]],
 ['provider_savings_goals',' WHERE handyman_id=1',i=>['INSERT INTO provider_savings_goals (handyman_id,goal_amount,current_amount) VALUES (1,?,?)',[20000+i*1000,1000+i*500]]],
 ['provider_investments',' WHERE handyman_id=1',i=>['INSERT INTO provider_investments (handyman_id,initial_amount,monthly_contribution,annual_rate,years) VALUES (1,?,?,?,?)',[10000+i*100,1000+i*50,5+i/10,2+i]]]
 ];
 for(const [table,where,make] of configs){const [[{n}]]=await c.query('SELECT COUNT(*) n FROM '+table+where);for(let i=n+1;i<=10;i++){const [sql,values]=make(i);await c.execute(sql,values);}}
 // Ten distinct months make the single-object income summary endpoint useful too.
 for(let i=1;i<=10;i++){const month=`2026-${String(i).padStart(2,'0')}`;const [[{n}]]=await c.execute("SELECT COUNT(*) n FROM provider_income WHERE handyman_id=1 AND DATE_FORMAT(income_date,'%Y-%m')=?",[month]);if(!n)await c.execute('INSERT INTO provider_income (handyman_id,amount,income_date) VALUES (1,?,?)',[20000+i*1000,month+'-01']);}
 await c.commit();
 for(const [table,where] of configs){const [[{n}]]=await c.query('SELECT COUNT(*) n FROM '+table+where);console.log(table+(where?' (provider 1)':'')+': '+n);}
 const [[{n}]]=await c.query('SELECT COUNT(*) n FROM provider_income WHERE handyman_id=1');console.log('provider_income (provider 1): '+n);
 }catch(e){await c.rollback();throw e;}finally{await c.query("SELECT RELEASE_LOCK('moneymentor-demo-seed')");c.release();await db.end();}}
main().catch(e=>{console.error(e.code||e.message);process.exitCode=1;});
