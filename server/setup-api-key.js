const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),dotenv=require('dotenv');
const file=path.join(__dirname,process.argv.includes('--demo')?'.env.demo':'.env');
if(!fs.existsSync(file))throw new Error('Environment file missing');
let text=fs.readFileSync(file,'utf8');const env=dotenv.parse(text);
const existing=(env.API_KEYS||'').split(',').map(s=>s.trim()).filter(Boolean);
const consumer=env.HANDYNEAR_API_KEY||existing[0]||crypto.randomBytes(24).toString('hex');
const own=env.MONEYMENTOR_TEST_API_KEY||crypto.randomBytes(24).toString('hex');
if(own===consumer)throw new Error('Own-team and consumer keys must differ');
for(const [name,value] of Object.entries({HANDYNEAR_API_KEY:consumer,MONEYMENTOR_TEST_API_KEY:own,API_KEYS:[...new Set([...existing,consumer,own])].join(','),RATE_LIMIT_MAX:env.RATE_LIMIT_MAX||'100'})){
 const pattern=new RegExp('^'+name+'=.*$','m');text=pattern.test(text)?text.replace(pattern,name+'='+value):text+'\n'+name+'='+value;
}
fs.writeFileSync(file,text.trimEnd()+'\n');
console.log('Preserved HandyNear key; separate own-team testing key configured. No secrets printed.');
