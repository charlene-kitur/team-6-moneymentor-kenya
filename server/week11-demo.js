// Isolated local demonstration. Does not change .env.demo, the real API or tunnel.
const express=require('express');
const path=require('node:path');
const {mountPartnerApi}=require('./partner-api');
const app=express();
mountPartnerApi(app,{partnerUrl:'http://127.0.0.1:4000'});
app.use(express.static(path.join(__dirname,'../build')));
app.listen(3100,'127.0.0.1',()=>console.log('Week 11 controlled demo: http://127.0.0.1:3100 (sample partner, not live Prestige)'));
