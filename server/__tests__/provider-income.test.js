const {setupProvider}=require('../test-support/provider');
const s=setupProvider();
const url=()=>`/api/handymen/${s.id}/income-summaries`;
test('monthly income totals respect provider and month, including expenses',async()=>{
 await s.db.execute('INSERT INTO provider_income (handyman_id,amount,income_date) VALUES (?,?,?),(?,?,?),(?,?,?)',[s.id,5000,'2026-09-01',s.other,9999,'2026-09-01',s.id,999,'2026-08-31']);
 await s.db.execute('INSERT INTO provider_expenses (handyman_id,description,category,amount,expense_date) VALUES (?,?,?,?,?)',[s.id,'Tools','Equipment',1200,'2026-09-30']);
 const r=await s.call('get',url()+'?month=2026-09');
 expect(r.status).toBe(200);expect(r.body).toEqual({handyman_id:s.id,month:'2026-09',total_income:5000,total_expenses:1200,net_income:3800});
});
test('empty month returns numeric zeros',async()=>{const r=await s.call('get',url()+'?month=2026-09');expect(r.status).toBe(200);expect(r.body).toEqual({handyman_id:s.id,month:'2026-09',total_income:0,total_expenses:0,net_income:0});});
test.each(['','?month=Sept2026','?month=2026-13','?month=2026-09&month=2026-10'])('invalid month %s returns 400',async query=>{const r=await s.call('get',url()+query);expect(r.status).toBe(400);expect(r.body.error).toEqual(expect.any(String));});
test('missing provider returns 404',async()=>{const id=await s.missing();const r=await s.call('get',`/api/handymen/${id}/income-summaries?month=2026-09`,undefined,id);expect(r.status).toBe(404);expect(r.body.error).toEqual(expect.any(String));});
