const express=require('express');
const app=express();
app.get('/health',(req,res)=>res.json({status:'ok'}));
app.get('/claims',(req,res)=>{
 if(req.query.status!=='claimed')return res.status(400).json({error:'This stand-in supports status=claimed only.'});
 res.json([{claimId:'c1',studentId:'s1',itemId:'i1',status:'claimed',rewardAmountCents:1500,submittedAt:'2026-07-01T09:15:00Z'}]);
});
app.listen(5100,'127.0.0.1',()=>console.log('LOCAL SAMPLE ONLY: http://127.0.0.1:5100. Not the live producer.'));
