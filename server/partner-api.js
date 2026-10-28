function mountPartnerApi(app, options = {}) {
 app.get('/api/partner/rewards', async (req,res) => {
  try {
   const base=options.partnerUrl || process.env.PARTNER_URL;
   if(!base) throw Object.assign(new Error('Partner URL not configured'),{code:'PARTNER_NOT_CONFIGURED'});
   const url=new URL(base);
   if(!['http:','https:'].includes(url.protocol)||url.username||url.password) throw new Error('Invalid partner URL');
   const response=await fetch(base.replace(/\/$/,'')+'/claims?status=claimed',{headers:process.env.PARTNER_API_KEY?{'X-API-Key':process.env.PARTNER_API_KEY}:{},signal:AbortSignal.timeout(10000)});
   if(!response.ok){console.error('Partner returned',response.status);return res.status(502).json({message:'Partner data is unavailable right now. Please try again later.'});}
   const rows=await response.json();
   if(!Array.isArray(rows)||rows.some(r=>!r||typeof r.claimId!=='string'||typeof r.studentId!=='string'||typeof r.itemId!=='string'||r.status!=='claimed'||!Number.isSafeInteger(r.rewardAmountCents)||r.rewardAmountCents<0)) throw Object.assign(new Error('Partner response shape mismatch'),{code:'PARTNER_SHAPE_MISMATCH'});
   res.json({source:process.env.PARTNER_DEMO==='true'?'Local sample data':'Partner API',claims:rows.map(({claimId,studentId,itemId,status,rewardAmountCents})=>({claimId,studentId,itemId,status,rewardAmountCents}))});
  }catch(e){console.error('Partner call failed:',e.cause?.code||e.code||e.message);res.status(502).json({message:'Partner data is unavailable right now. Please try again later.'});}
 });
}
module.exports={mountPartnerApi};
