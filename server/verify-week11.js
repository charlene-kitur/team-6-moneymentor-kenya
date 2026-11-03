const express=require('express');
const fs=require('node:fs');
const path=require('node:path');
const {createFlakyPartner}=require('./flaky-partner');
const {mountPartnerApi}=require(process.argv[2]||'./partner-api');
const listen=app=>new Promise(resolve=>{const s=app.listen(0,'127.0.0.1',()=>resolve(s));});
const close=s=>new Promise(resolve=>{s.close(resolve);s.closeAllConnections();});
(async()=>{
 const partner=await listen(createFlakyPartner()); const base='http://127.0.0.1:'+partner.address().port;
 const makeApp=()=>{const a=express();mountPartnerApi(a,{partnerUrl:base});return listen(a);};
 let api=await makeApp(); const results=[]; const logs=[]; const oldError=console.error,oldWarn=console.warn;
 console.error=(...args)=>{logs.push(args.join(' '));oldError(...args);};console.warn=(...args)=>{logs.push(args.join(' '));oldWarn(...args);};
 async function check(mode,label=mode){
  if(mode!=='stopped')await fetch(base+'/__mode/'+mode);
  const start=performance.now(); const offset=logs.length;
  const r=await fetch('http://127.0.0.1:'+api.address().port+'/api/partner/rewards');const body=await r.json();
  const ms=Math.round(performance.now()-start);const calls=mode==='stopped'?null:(await(await fetch(base+'/__stats')).json()).calls;
  results.push({scenario:label,status:r.status,ms,calls,body,logs:logs.slice(offset)});
 }
 try{
  let start=performance.now();await(await fetch(base+'/claims')).json();results.push({scenario:'normal direct partner',ms:Math.round(performance.now()-start)});
  await check('ok');await check('slow');await check('flaky');await check('error');await check('bad');await check('denied');await check('limited');await check('ok','recovery');
  await close(api);api=await makeApp();await check('slow','slow after restart, empty cache');
  await check('ok','prime cache before stop');await close(partner);await check('stopped');
  const target=path.join(__dirname,'../docs/evidence',process.argv[2]?'WEEK11_BEFORE.json':'WEEK11_AFTER.json');fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,JSON.stringify({testedAt:new Date().toISOString(),controlledPartner:true,results},null,2));
  console.log(JSON.stringify(results.map(({scenario,status,ms,calls})=>({scenario,status,ms,calls})),null,2));
 }finally{await close(api);if(partner.listening)await close(partner);console.error=oldError;console.warn=oldWarn;}
})().catch(e=>{console.error(e);process.exitCode=1;});
