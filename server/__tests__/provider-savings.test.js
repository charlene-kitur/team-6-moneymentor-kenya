const {setupProvider}=require('../test-support/provider');
const s=setupProvider();
const url=id=>`/api/handymen/${id}/savings-goals`;
test('savings progress includes only owned goals and supports overfunding',async()=>{
 const [row]=await s.db.execute('INSERT INTO provider_savings_goals (handyman_id,goal_amount,current_amount) VALUES (?,?,?)',[s.id,1000,1250]);
 await s.db.execute('INSERT INTO provider_savings_goals (handyman_id,goal_amount,current_amount) VALUES (?,?,?)',[s.other,1000,100]);
 const r=await s.call('get',url(s.id));expect(r.status).toBe(200);expect(r.body).toEqual([{id:row.insertId,handyman_id:s.id,goal_amount:1000,current_amount:1250,progress_percentage:125}]);
});
test('existing provider with no goals returns empty array',async()=>{const r=await s.call('get',url(s.id));expect(r.status).toBe(200);expect(r.body).toEqual([]);});
test('missing provider returns 404',async()=>{const id=await s.missing();const r=await s.call('get',url(id),undefined,id);expect(r.status).toBe(404);expect(r.body.error).toEqual(expect.any(String));});
test('invalid provider ID returns 400',async()=>{const r=await s.call('get',url('abc'));expect(r.status).toBe(400);expect(r.body.error).toEqual(expect.any(String));});
