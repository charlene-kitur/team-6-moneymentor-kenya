const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp, validExpense } = require('./app');
const sample = { description: "Test expense ' quoted", category: 'Transport', amount: 125.50, expense_date: '2026-09-08' };
test('validates money and calendar dates', () => {
 assert.equal(validExpense(sample), true);
 for (const change of [{amount:0},{amount:-1},{amount:1.001},{amount:'20'},{expense_date:'2026-02-30'},{description:' '},{category:'invalid'}]) assert.equal(validExpense({...sample,...change}),false);
});
test('real MySQL read, insert, validation, and persistent readback', async () => {
 const db = require('./db');
 const connection = await db.getConnection();
 await connection.beginTransaction();
 const server = createApp(connection).listen(0,'127.0.0.1');
 await new Promise(resolve=>server.once('listening',resolve));
 const url = `http://127.0.0.1:${server.address().port}`;
 try {
  let response = await fetch(url+'/api/expenses');
  assert.equal(response.status,200); assert.ok(Array.isArray(await response.json()));
  response = await fetch(url+'/api/expenses',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(sample)});
  assert.equal(response.status,201); const saved = await response.json();
  const rows = await (await fetch(url+'/api/expenses')).json();
  assert.deepEqual(rows.find(row=>row.id===saved.id),saved);
  const patch = payload => fetch(url+'/api/expenses/'+saved.id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  response = await patch({amount:1500});
  assert.equal(response.status,200);
  const expected = {...saved,amount:1500};
  assert.deepEqual(await response.json(),expected);
  for (const payload of [{},[],{amount:'1500'},{amount:-1},{amount:1.001},{description:' '},{category:'invalid'},{expense_date:'2026-02-30'},{id:99}]) {
   response = await patch(payload);
   assert.equal(response.status,400);
   const [unchanged] = await connection.execute('SELECT id, description, category, amount, expense_date FROM expenses WHERE id = ?', [saved.id]);
   assert.deepEqual(unchanged[0],expected);
  }
  response = await patch({amount:1500});
  assert.equal(response.status,200);
  response = await fetch(url+'/api/expenses/invalid',{method:'DELETE'});
  assert.equal(response.status,400);
  const [[beforeDelete]] = await connection.execute('SELECT COUNT(*) AS count FROM expenses WHERE id = ?', [saved.id]);
  assert.equal(beforeDelete.count,1);
  response = await fetch(url+'/api/expenses/'+saved.id,{method:'DELETE'});
  assert.equal(response.status,204);
  assert.equal(await response.text(),'');
  const [[afterDelete]] = await connection.execute('SELECT COUNT(*) AS count FROM expenses WHERE id = ?', [saved.id]);
  assert.equal(afterDelete.count,0);
  response = await patch({amount:200});
  assert.equal(response.status,404);
  const [[stillMissing]] = await connection.execute('SELECT COUNT(*) AS count FROM expenses WHERE id = ?', [saved.id]);
  assert.equal(stillMissing.count,0);
  response = await fetch(url+'/api/expenses/'+saved.id,{method:'DELETE'});
  assert.equal(response.status,404);
  response = await fetch(url+'/api/expenses',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...sample,amount:-1})});
  assert.equal(response.status,400);
  for (const [resource, payload] of [['budgets', {income:50000,fixed:20000,variable:10000}], ['savings-goals',{goal_amount:100000,monthly_save:5000}]]) {
   response = await fetch(url+'/api/'+resource,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
   assert.equal(response.status,201); const record = await response.json();
   const list = await (await fetch(url+'/api/'+resource)).json();
   assert.ok(list.some(row=>row.id===record.id && Object.keys(payload).every(key=>row[key]===payload[key])));
   response = await fetch(url+'/api/'+resource,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(Object.keys(payload).map(key=>[key,-1])))});
   assert.equal(response.status,400);
  }
  response = await fetch(url+'/api/questions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Test Person',email:'test@example.com',question:'How do I save?'})});
  assert.equal(response.status,201); const question = await response.json();
  const [[stored]] = await connection.execute('SELECT question FROM contact_questions WHERE id = ?', [question.id]);
  assert.equal(stored.question,'How do I save?');
  response = await fetch(url+'/api/questions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Test',email:'invalid',question:'Hello'})});
  assert.equal(response.status,400);
  response = await fetch(url+'/api/expenses',{method:'POST',headers:{'Content-Type':'application/json'},body:'{'});
  assert.equal(response.status,400);
 } finally { await new Promise(resolve=>server.close(resolve)); await connection.rollback(); connection.release(); await db.end(); }
});
test('database outage returns safe JSON error', async () => {
 const server = createApp({query:async()=>{throw new Error('private credentials');}}).listen(0,'127.0.0.1');
 await new Promise(resolve=>server.once('listening',resolve));
 try { const response = await fetch(`http://127.0.0.1:${server.address().port}/api/expenses`); assert.equal(response.status,503); assert.ok(!(await response.text()).includes('private credentials')); }
 finally { await new Promise(resolve=>server.close(resolve)); }
});
