// Isolated local rehearsal; no keys or database writes.
process.env.PARTNER_URL='http://127.0.0.1:5100';
process.env.PARTNER_DEMO='true';
const express=require('express');
const cors=require('cors');
const app=express();
app.use(cors({origin:'http://localhost:3000'}));
app.get('/api/health',(req,res)=>res.json({status:'ok',mode:'integration rehearsal'}));
require('./partner-api').mountPartnerApi(app);
app.listen(5101,'127.0.0.1',()=>console.log('Rehearsal backend http://127.0.0.1:5101; other MoneyMentor routes use the normal API.'));
