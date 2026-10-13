const {setupProvider}=require('../test-support/provider');
const s=setupProvider();
const payload={description:'Replacement tools',category:'Equipment',amount:2500,expense_date:'2026-09-29'};
const create=()=>s.call('post',`/api/handymen/${s.id}/expenses`,payload);
test('POST contract shape, PATCH persistence/repeatability and DELETE absence',async()=>{
 const c=await create();expect(c.status).toBe(201);expect(c.body).toEqual({id:expect.any(Number),handyman_id:s.id,...payload});
 const path=`/api/expenses/${c.body.id}`;
 for(let i=0;i<2;i++){const r=await s.call('patch',path,{amount:3000});expect(r.status).toBe(200);expect(r.body).toEqual({...c.body,amount:3000});}
 const summary=await s.call('get',`/api/handymen/${s.id}/income-summaries?month=2026-09`);expect(summary.body.total_expenses).toBe(3000);
 const d=await s.call('delete',path);expect(d.status).toBe(204);expect(d.text).toBe('');
 const after=await s.call('get',`/api/handymen/${s.id}/income-summaries?month=2026-09`);expect(after.body.total_expenses).toBe(0);
 for(const method of ['delete','patch']){const r=await s.call(method,path,{amount:1});expect(r.status).toBe(404);expect(r.body.error).toEqual(expect.any(String));}
});
test.each(Object.keys(payload))('POST enforces required field %s without writes',async key=>{
 const body={...payload};delete body[key];const r=await s.call('post',`/api/handymen/${s.id}/expenses`,body);expect(r.status).toBe(400);expect(r.body.error).toEqual(expect.any(String));
 const [[row]]=await s.db.execute('SELECT COUNT(*) AS n FROM provider_expenses WHERE handyman_id=?',[s.id]);expect(row.n).toBe(0);
});
test.each([{description:123},{category:123},{expense_date:123},{amount:'1'},{amount:0},{amount:1.001},{description:''},{category:''},{expense_date:'2026-02-30'},{unexpected:1}])('invalid fields %j are rejected by POST and PATCH without mutation',async change=>{
 const c=await create();expect(c.status).toBe(201);
 const post=await s.call('post',`/api/handymen/${s.id}/expenses`,{...payload,...change});expect(post.status).toBe(400);
 const patch=await s.call('patch',`/api/expenses/${c.body.id}`,change);expect(patch.status).toBe(400);
 const [rows]=await s.db.execute('SELECT id,handyman_id,description,category,amount,expense_date FROM provider_expenses WHERE handyman_id=?',[s.id]);expect(rows).toEqual([c.body]);
});
test('minimum amount and maximum text lengths are accepted',async()=>{const r=await s.call('post',`/api/handymen/${s.id}/expenses`,{...payload,amount:0.01,description:'a'.repeat(200),category:'a'.repeat(40)});expect(r.status).toBe(201);expect(r.body.amount).toBe(0.01);});
test('missing provider on create returns 404',async()=>{const id=await s.missing();const r=await s.call('post',`/api/handymen/${id}/expenses`,payload,id);expect(r.status).toBe(404);});
test('empty PATCH rejected',async()=>{const c=await create();const r=await s.call('patch',`/api/expenses/${c.body.id}`,{});expect(r.status).toBe(400);});
test.each(['0','abc','2147483648'])('invalid expense ID %s rejected',async id=>{for(const method of ['patch','delete']){const r=await s.call(method,`/api/expenses/${id}`,{amount:1});expect(r.status).toBe(400);}});
test('other provider cannot update or delete expense',async()=>{const c=await create();for(const method of ['patch','delete']){const r=await s.call(method,`/api/expenses/${c.body.id}`,{amount:1},s.other);expect(r.status).toBe(404);}const [[row]]=await s.db.execute('SELECT amount FROM provider_expenses WHERE id=?',[c.body.id]);expect(row.amount).toBe(2500);});
