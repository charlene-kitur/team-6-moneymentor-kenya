require('dotenv').config({path:require('path').join(__dirname,'.env.demo'),override:true});
const db=require('./db'),{createApp}=require('./app'),{execFileSync}=require('child_process');
(async()=>{const server=createApp(db).listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));try{
const base='http://127.0.0.1:'+server.address().port;
const token=execFileSync(process.execPath,[require('path').join(__dirname,'demo-token.js'),'1'],{encoding:'utf8'}).trim();
const headers={'X-API-Key':process.env.MONEYMENTOR_TEST_API_KEY || process.env.API_KEYS.split(',')[0],Authorization:'Bearer '+token};
for(const route of ['/api/expenses','/api/budgets','/api/savings-goals']){const r=await fetch(base+route,{headers});const rows=await r.json();if(r.status!==200 || rows.length<10)throw Error('Failed '+route);console.log(route+': HTTP 200, '+rows.length+' records');}
const denied=await fetch(base+'/api/expenses');if(denied.status!==401)throw Error('Missing-key check failed');console.log('Missing API key: HTTP 401');
}finally{await new Promise(r=>server.close(r));await db.end();}})().catch(e=>{console.error(e.message);process.exitCode=1;});
