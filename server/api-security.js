const crypto = require('node:crypto');
function apiSecurity(options = {}) {
 const keys = (options.apiKeys || process.env.API_KEYS || '').split(',').map(x=>x.trim()).filter(x=>x.length>=32);
 const allowed = new Set(keys.map(key=>crypto.createHash('sha256').update(key).digest('hex')));
 const max = Number(options.rateLimitMax || process.env.RATE_LIMIT_MAX || 100);
 if (!Number.isInteger(max) || max < 1) throw new Error('Invalid rate limit');
 const buckets = new Map();
 return (req,res,next)=>{
  if(req.method==='GET' && req.path==='/api/health') return next();
  const key=req.get('X-API-Key') || '';
  const id=crypto.createHash('sha256').update(key).digest('hex');
  if(!allowed.has(id)) return res.status(401).json({error:'Missing or invalid API key'});
  const now=Date.now(); let bucket=buckets.get(id);
  if(!bucket || now>=bucket.until){bucket={count:0,until:now+60000};buckets.set(id,bucket);}
  if(bucket.count>=max){res.set('Retry-After',String(Math.ceil((bucket.until-now)/1000)));return res.status(429).json({error:'Rate limit exceeded. Try again later.'});}
  bucket.count++; next();
 };
}
module.exports={apiSecurity};
