require('dotenv').config({path:require('path').join(__dirname,'.env.demo'),override:true});
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');const db=require('./db'),{createApp}=require('./app');
(async()=>{const key=process.env.MONEYMENTOR_TEST_API_KEY,consumer=process.env.HANDYNEAR_API_KEY;assert.ok(key&&consumer&&key!==consumer);
const server=createApp(db,{rateLimitMax:3}).listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
const lines=['Week 9 HTTP verification',new Date().toISOString(),'Real MySQL database; temporary loopback server. Limit 3 applies only to this instance.'];
try{const base='http://127.0.0.1:'+server.address().port;
for(const [label,headers,status]of [['No key',{},401],['Wrong key',{'X-API-Key':'wrong'},401],['Public health',{},200]]){
 const r=await fetch(base+(label==='Public health'?'/api/health':'/api/expenses'),{headers});assert.equal(r.status,status);lines.push(label+': '+r.status+' '+await r.text());}
const codes=[];for(let i=0;i<5;i++){const r=await fetch(base+'/api/expenses',{headers:{'X-API-Key':key}});codes.push(r.status);if(i>=3){assert.ok(Number(r.headers.get('retry-after'))>0);lines.push('429 Retry-After: '+r.headers.get('retry-after')+'; body: '+await r.text());}}
assert.deepEqual(codes,[200,200,200,429,429]);lines.push('Own-team key: '+codes.join(' '));
const r=await fetch(base+'/api/expenses',{headers:{'X-API-Key':consumer}});assert.equal(r.status,200);lines.push('Separate consumer key: 200 (independent limit)');
assert.equal(Number(process.env.RATE_LIMIT_MAX),100);lines.push('Configured deployment limit remains 100/minute. No key values recorded.');
fs.writeFileSync(path.join(__dirname,'../docs/WEEK9_HTTP_RESULTS.txt'),lines.join('\n')+'\n');console.log(lines.join('\n'));
}finally{await new Promise(r=>server.close(r));await db.end();}})().catch(e=>{console.error(e.code||e.message);process.exitCode=1;});
