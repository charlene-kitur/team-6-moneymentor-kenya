const express=require('express');
const request=require('supertest');
const {mountPartnerApi}=require('../partner-api');
let upstream,port,mode='ok';
const listen=(p=0)=>new Promise(resolve=>{
 const app=express();
 app.get('/claims',(req,res)=>{if(mode==='bad')return res.json([{claimId:'c1',reward_amount:1500}]);if(mode==='denied')return res.status(401).json({error:'missing X-API-Key header'});res.json([{claimId:'c1',studentId:'s1',itemId:'i1',status:'claimed',rewardAmountCents:1500}]);});
 upstream=app.listen(p,'127.0.0.1',()=>{port=upstream.address().port;resolve();});
});
const stop=()=>new Promise(resolve=>{upstream.close(resolve);upstream.closeAllConnections();});
afterEach(async()=>{if(upstream?.listening)await stop();});
test('real HTTP stand-in: data, stopped provider, other route healthy, recovery',async()=>{
 await listen();
 const app=express();app.get('/health',(req,res)=>res.json({status:'ok'}));mountPartnerApi(app,{partnerUrl:`http://127.0.0.1:${port}`});
 let r=await request(app).get('/api/partner/rewards');expect(r.status).toBe(200);expect(r.body.claims[0].rewardAmountCents).toBe(1500);
 await stop();r=await request(app).get('/api/partner/rewards');expect(r.status).toBe(200);expect(r.body.stale).toBe(true);expect((await request(app).get('/health')).status).toBe(200);
 await listen(port);expect((await request(app).get('/api/partner/rewards')).status).toBe(200);
});
test('wrong response fields produce friendly error',async()=>{mode='bad';await listen();const app=express();mountPartnerApi(app,{partnerUrl:`http://127.0.0.1:${port}`});expect((await request(app).get('/api/partner/rewards')).status).toBe(502);mode='ok';});
test('provider rejection is not presented as an empty success',async()=>{mode='denied';await listen();const app=express();mountPartnerApi(app,{partnerUrl:`http://127.0.0.1:${port}`});expect((await request(app).get('/api/partner/rewards')).status).toBe(502);mode='ok';});
