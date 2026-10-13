const {setupProvider}=require('../test-support/provider');
const s=setupProvider();
const url=id=>`/api/handymen/${id}/investment-projections`;
test.each([[12,1,2395.08],[0,1,2200],[12,0,1000]])('projection rate %s years %s matches expected amount',async(rate,years,expected)=>{
 await s.db.execute('INSERT INTO provider_investments (handyman_id,initial_amount,monthly_contribution,annual_rate,years) VALUES (?,?,?,?,?)',[s.id,1000,100,rate,years]);
 await s.db.execute('INSERT INTO provider_investments (handyman_id,initial_amount,monthly_contribution,annual_rate,years) VALUES (?,?,?,?,?)',[s.other,1,1,0,1]);
 const r=await s.call('get',url(s.id));expect(r.status).toBe(200);expect(r.body).toEqual([{handyman_id:s.id,initial_amount:1000,monthly_contribution:100,annual_rate:rate,years,projected_value:expected}]);
});
test('no investments returns empty array',async()=>{const r=await s.call('get',url(s.id));expect(r.status).toBe(200);expect(r.body).toEqual([]);});
test('missing provider returns 404',async()=>{const id=await s.missing();const r=await s.call('get',url(id),undefined,id);expect(r.status).toBe(404);expect(r.body.error).toEqual(expect.any(String));});
test('invalid provider ID returns 400',async()=>{const r=await s.call('get',url('abc'));expect(r.status).toBe(400);});
