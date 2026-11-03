const {fetchWithRetry}=require('./resilientFetch');
function mountPartnerApi(app, options = {}) {
 let lastGood=null;
 app.get('/api/partner/rewards', async (req,res) => {
  res.set('Cache-Control','no-store');
  const base=options.partnerUrl || process.env.PARTNER_URL;
  try {
   if(!base)throw new Error('Not configured');
   const url=new URL(base);
   if(!['http:','https:'].includes(url.protocol)||url.username||url.password)throw new Error('Invalid URL');
   const rows=await fetchWithRetry(base.replace(/\/$/,'')+'/claims?status=claimed',{
    headers:process.env.PARTNER_API_KEY?{'X-API-Key':process.env.PARTNER_API_KEY}:{}
   },{timeoutMs:1500,retries:2,delayMs:200,...options.retryConfig,readBody:async response=>{
    if(!response.ok)throw Object.assign(new Error(),{status:response.status});
    return response.json();
   }});
   if(!Array.isArray(rows)||rows.some(r=>!r||typeof r.claimId!=='string'||typeof r.studentId!=='string'||typeof r.itemId!=='string'||r.status!=='claimed'||!Number.isSafeInteger(r.rewardAmountCents)||r.rewardAmountCents<0))throw Object.assign(new Error(),{code:'PARTNER_SHAPE_MISMATCH'});
   const data={source:process.env.PARTNER_DEMO==='true'?'Local sample data':'Partner API',claims:rows.map(({claimId,studentId,itemId,status,rewardAmountCents})=>({claimId,studentId,itemId,status,rewardAmountCents})),asOf:new Date().toISOString()};
   lastGood={base,data};return res.json({...data,stale:false});
  }catch(e){
   const reason=e.status?'HTTP '+e.status:['TimeoutError','AbortError'].includes(e.name)?'timeout':e.code==='PARTNER_SHAPE_MISMATCH'?'invalid response schema':e instanceof SyntaxError?'invalid JSON':e.cause?.code==='ECONNREFUSED'?'connection refused':'partner request failed';
   console.error('Partner call failed:',reason);
   if(lastGood?.base===base)return res.json({...lastGood.data,stale:true});
   return res.status(502).json({message:'Partner data is unavailable right now. Please try again later.'});
  }
 });
}
module.exports={mountPartnerApi};
