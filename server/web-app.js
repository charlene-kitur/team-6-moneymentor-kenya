const express=require('express');
const path=require('node:path');
// Local team UI only. Never expose this listener through a tunnel.
function createWebApp({apiUrl,apiKey,webPort=3000,buildPath=path.join(__dirname,'../build')}) {
 if(!apiKey)throw new Error('Own-team API key not configured');
 const target=new URL(apiUrl);
 if(target.protocol!=='http:' || !['127.0.0.1','localhost'].includes(target.hostname))throw new Error('Web gateway requires a loopback API');
 const app=express();
 app.use((req,res,next)=>{
  const hosts=[`localhost:${webPort}`,`127.0.0.1:${webPort}`];
  if(!hosts.includes(req.get('host')))return res.status(403).json({message:'Local access only'});
  if(req.get('origin')&&!hosts.map(h=>'http://'+h).includes(req.get('origin')))return res.status(403).json({message:'Local access only'});
  if(req.get('sec-fetch-site')==='cross-site')return res.status(403).json({message:'Local access only'});
  next();
 });
 app.get('/api/partner/rewards',async(req,res)=>{
  res.set('Cache-Control','no-store');
  try{
   const r=await fetch(new URL('/api/partner/rewards',target),{headers:{'X-API-Key':apiKey}});
   const body=await r.json();
   if(!r.ok)return res.status(502).json({message:'Partner data is unavailable right now. Please try again later.'});
   res.json(body);
  }catch{res.status(502).json({message:'Partner data is unavailable right now. Please try again later.'});}
 });
 app.use('/api',(_req,res)=>res.status(404).json({message:'Route not available through local web gateway'}));
 app.use(express.static(buildPath));
 app.get('/',(_req,res)=>res.status(503).send('Build the web app first: npm.cmd run build'));
 return app;
}
module.exports={createWebApp};
