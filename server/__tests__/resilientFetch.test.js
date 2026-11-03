const {fetchWithRetry}=require('../resilientFetch');
test.each([400,401,403,404])('does not retry HTTP %i',async status=>{
 const fetchImpl=jest.fn(async()=>new Response('',{status}));
 expect((await fetchWithRetry('http://partner',{}, {fetchImpl})).status).toBe(status);expect(fetchImpl).toHaveBeenCalledTimes(1);
});
test.each(['POST','PUT','PATCH','DELETE'])('never retries %s',async method=>{
 const fetchImpl=jest.fn(async()=>new Response('',{status:503}));
 await fetchWithRetry('http://partner',{method},{fetchImpl});expect(fetchImpl).toHaveBeenCalledTimes(1);
});
test('caps retries at two and increases delays',async()=>{
 const fetchImpl=jest.fn(async()=>new Response('',{status:503})),wait=jest.fn(async()=>{});
 await fetchWithRetry('http://partner',{}, {fetchImpl,wait,retries:99});expect(fetchImpl).toHaveBeenCalledTimes(3);expect(wait.mock.calls).toEqual([[200],[400]]);
});
test('honors Retry-After seconds and declines overly long wait',async()=>{
 const wait=jest.fn(async()=>{});let calls=0;
 const fetchImpl=async()=>new Response('',{status:++calls===1?429:200,headers:{'Retry-After':'2'}});
 await fetchWithRetry('http://partner',{}, {fetchImpl,wait});expect(wait).toHaveBeenCalledWith(2000);
 const long=jest.fn(async()=>new Response('',{status:429,headers:{'Retry-After':'60'}}));
 await fetchWithRetry('http://partner',{}, {fetchImpl:long,wait});expect(long).toHaveBeenCalledTimes(1);
});
test('malformed JSON is not retried',async()=>{
 const fetchImpl=jest.fn(async()=>new Response('not JSON'));
 await expect(fetchWithRetry('http://partner',{}, {fetchImpl,readBody:r=>r.json()})).rejects.toThrow();expect(fetchImpl).toHaveBeenCalledTimes(1);
});
