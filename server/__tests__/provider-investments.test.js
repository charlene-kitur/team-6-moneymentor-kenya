const {setupProvider}=require('../test-support/provider');
const s=setupProvider();
test('retired provider route returns 404',async()=>{expect((await s.call('get', '/api/handymen/'+s.id+'/investment-projections')).status).toBe(404);});
