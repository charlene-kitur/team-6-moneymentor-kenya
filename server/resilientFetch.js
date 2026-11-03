const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function fetchWithRetry(url, options = {}, config = {}) {
 const {timeoutMs=1500, retries=2, delayMs=200, readBody=async r=>r, fetchImpl=fetch, wait=sleep}=config;
 const maxRetries=(options.method||'GET').toUpperCase()==='GET'?Math.min(2,Math.max(0,retries)):0;
 for(let attempt=0;;attempt++) {
  let delay=delayMs*2**attempt, reason;
  try {
   const response=await fetchImpl(url,{...options,signal:AbortSignal.timeout(timeoutMs)});
   if(response.status!==429 && response.status<500)return await readBody(response);
   if(attempt>=maxRetries)return await readBody(response);
   reason='HTTP '+response.status;
   if(response.status===429){
    const header=response.headers.get('Retry-After');
    const seconds=header===null?NaN:Number(header);
    const retryMs=Number.isFinite(seconds)?seconds*1000:Date.parse(header)-Date.now();
    // Never retry earlier than requested; long waits go to fallback instead.
    if(retryMs>5000)return await readBody(response);
    if(Number.isFinite(retryMs)&&retryMs>=0)delay=retryMs;
   }
   await response.body?.cancel();
  } catch(error) {
   const transient=['TimeoutError','AbortError'].includes(error.name)||(error instanceof TypeError && Boolean(error.cause?.code));
   if(!transient||attempt>=maxRetries)throw error;
   reason=['TimeoutError','AbortError'].includes(error.name)?'timeout':'connection failure';
  }
  console.warn(`Partner attempt ${attempt+1} failed (${reason}); retrying in ${delay} ms`);
  await wait(delay);
 }
}
module.exports={fetchWithRetry};
