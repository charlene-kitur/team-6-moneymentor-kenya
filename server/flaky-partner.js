const express = require('express');
function createFlakyPartner() {
 const app = express(); let mode = 'ok', calls = 0;
 app.get('/__mode/:mode', (req,res) => {
  if (!['ok','slow','flaky','error','bad','denied','limited'].includes(req.params.mode)) return res.sendStatus(400);
  mode=req.params.mode; calls=0; res.json({mode});
 });
 app.get('/__stats', (_req,res)=>res.json({mode,calls}));
 app.get('/claims', async (_req,res)=>{
  const call=++calls; console.log(`GET /claims (call ${call}, mode ${mode})`);
  if(mode==='slow') await new Promise(resolve=>{const timer=setTimeout(resolve,10000);res.on('close',()=>{clearTimeout(timer);resolve();});});
  if(res.destroyed)return;
  if(mode==='flaky' && call%3!==0)return res.sendStatus(503);
  if(mode==='error')return res.sendStatus(500);
  if(mode==='denied')return res.sendStatus(401);
  if(mode==='limited' && call===1)return res.set('Retry-After','1').sendStatus(429);
  if(mode==='bad')return res.json([{unexpected:'schema'}]);
  res.json([{claimId:'lab-1',studentId:'sample-student',itemId:'sample-item',status:'claimed',rewardAmountCents:15000}]);
 });
 return app;
}
if(require.main===module)createFlakyPartner().listen(4000,'127.0.0.1',()=>console.log('Controlled partner: http://127.0.0.1:4000'));
module.exports={createFlakyPartner};
