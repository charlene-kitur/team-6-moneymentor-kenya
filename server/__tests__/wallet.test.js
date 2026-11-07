const request = require('../test-support/request');
const jwt = require('jsonwebtoken');
const crypto = require('node:crypto');
const db = require('../db');
const {createApp} = require('../app');
const secret = crypto.randomBytes(48).toString('hex');
const app = createApp(db, {jwtSecret:secret, rateLimitMax:10000});
let customer, other, provider, booking;
const token = (id, role='customer') => jwt.sign({role},secret,{subject:String(id),expiresIn:'1h',issuer:'moneymentor-local',audience:'moneymentor-api'});
const call = (method,path,body,key='test-key',id=customer,role='customer') => {
  let r=request(app)[method](path).set('Authorization','Bearer '+token(id,role));
  if(key)r=r.set('Idempotency-Key',key);
  return body===undefined?r:r.send(body);
};
const topup=(amount=1000,key='topup')=>call('post',`/api/customers/${customer}/wallet/topups`,{amount_cents:amount},key);
const pay=(key='pay')=>call('post',`/api/bookings/${booking}/pay`,{},key);
beforeEach(async()=>{
  customer=crypto.randomInt(100000000,900000000);other=customer+1;booking=customer;
  const [p]=await db.execute('INSERT INTO handymen (name) VALUES (?)',['Wallet test fixture']);provider=p.insertId;
  await db.execute('INSERT INTO wallet_customers (id,name) VALUES (?,?),(?,?)',[customer,'Wallet fixture',other,'Other fixture']);
  await db.execute('INSERT INTO wallets (customer_id) VALUES (?),(?)',[customer,other]);
  await db.execute('INSERT INTO wallet_bookings (id,customer_id,handyman_id,amount_cents) VALUES (?,?,?,600)',[booking,customer,provider]);
});
afterEach(async()=>{
  await db.execute('DELETE FROM wallet_transactions WHERE customer_id IN (?,?)',[customer,other]);
  await db.execute('DELETE FROM wallet_bookings WHERE customer_id IN (?,?)',[customer,other]);
  await db.execute('DELETE FROM wallets WHERE customer_id IN (?,?)',[customer,other]);
  await db.execute('DELETE FROM wallet_customers WHERE id IN (?,?)',[customer,other]);
  await db.execute('DELETE FROM provider_income WHERE handyman_id=?',[provider]);
  await db.execute('DELETE FROM handymen WHERE id=?',[provider]);
});
afterAll(()=>db.end());
test('balance, topup, payment, income and history persist',async()=>{
  expect((await topup()).status).toBe(201);
  const paid=await pay();expect(paid.status).toBe(201);expect(paid.body.balance_after_cents).toBe(400);
  expect((await call('get',`/api/customers/${customer}/wallet`)).body.balance_cents).toBe(400);
  const history=await call('get',`/api/customers/${customer}/wallet/transactions`);expect(history.body).toHaveLength(2);
  const [[income]]=await db.execute('SELECT SUM(amount) AS total FROM provider_income WHERE handyman_id=?',[provider]);expect(Number(income.total)).toBe(6);
});
test('concurrent duplicate topups credit once',async()=>{
  const responses=await Promise.all([topup(),topup(),topup()]);expect(responses.every(r=>r.status===201)).toBe(true);expect(responses[0].body).toEqual(responses[1].body);
  expect((await call('get',`/api/customers/${customer}/wallet`)).body.balance_cents).toBe(1000);
});
test('concurrent duplicate payments debit once',async()=>{
  await topup();const responses=await Promise.all([pay(),pay(),pay()]);expect(responses.every(r=>r.status===201)).toBe(true);expect(responses[0].body).toEqual(responses[2].body);
  expect((await pay('different-key')).status).toBe(409);
  const [[income]]=await db.execute('SELECT COUNT(*) AS count FROM provider_income WHERE handyman_id=?',[provider]);expect(income.count).toBe(1);
});
test('two bookings cannot overspend a wallet concurrently',async()=>{
  await topup();await db.execute('INSERT INTO wallet_bookings (id,customer_id,handyman_id,amount_cents) VALUES (?,?,?,600)',[booking+1,customer,provider]);
  const results=await Promise.all([pay(),call('post',`/api/bookings/${booking+1}/pay`,{},'pay-2')]);expect(results.map(r=>r.status).sort()).toEqual([201,409]);
  expect((await call('get',`/api/customers/${customer}/wallet`)).body.balance_cents).toBe(400);
});
test('insufficient funds leave no payment and can be retried after topup',async()=>{
  expect((await pay()).status).toBe(409);expect((await call('get',`/api/customers/${customer}/wallet/transactions`)).body).toEqual([]);
  await topup();expect((await pay()).status).toBe(201);
});
test('customer cannot read or top up another wallet or pay another booking',async()=>{
  expect((await call('get',`/api/customers/${other}/wallet`)).status).toBe(404);
  expect((await call('get',`/api/customers/${other}/wallet/transactions`)).status).toBe(404);
  expect((await call('post',`/api/customers/${other}/wallet/topups`,{amount_cents:100})).status).toBe(404);
  expect((await call('post',`/api/bookings/${booking}/pay`,{},'x',other)).status).toBe(404);
});
test('customer and provider tokens cannot cross roles',async()=>{
  expect((await call('get',`/api/customers/${customer}/wallet`,undefined,'x',customer,'handyman')).status).toBe(401);
  expect((await call('get',`/api/handymen/${provider}/income-summaries?month=2026-11`,undefined,'x',provider)).status).toBe(401);
});
test('missing bearer token is rejected',async()=>{expect((await request(app).get(`/api/customers/${customer}/wallet`)).status).toBe(401);});
test.each([0,-1,1.5,'100',1000000001])('invalid amount %s is rejected',async amount=>{expect((await topup(amount)).status).toBe(400);});
test('keys bind to original payload and operation',async()=>{
  await topup();expect((await topup(2000)).status).toBe(409);expect((await pay('topup')).status).toBe(409);
  expect((await call('post',`/api/customers/${customer}/wallet/topups`,{amount_cents:1},null)).status).toBe(400);
});
test('payment price cannot be supplied by customer; cancelled booking cannot be paid',async()=>{
  await topup();expect((await call('post',`/api/bookings/${booking}/pay`,{amount_cents:1})).status).toBe(400);
  await db.execute("UPDATE wallet_bookings SET status='cancelled' WHERE id=?",[booking]);expect((await pay()).status).toBe(409);
});
test('ledger failure rolls back balance, booking and provider income',async()=>{
  await topup();
  const failingDb = {getConnection:async()=>{
    const connection=await db.getConnection();
    return new Proxy(connection,{get(target,name){
      if(name==='execute')return (sql,args)=>{
        if(sql.startsWith('INSERT INTO wallet_transactions'))throw new Error('Injected ledger failure');
        return target.execute(sql,args);
      };
      const value=target[name];return typeof value==='function'?value.bind(target):value;
    }});
  }};
  const failingApp=createApp(failingDb,{jwtSecret:secret});
  const result=await request(failingApp).post(`/api/bookings/${booking}/pay`).set('Authorization','Bearer '+token(customer)).set('Idempotency-Key','rollback-test').send({});
  expect(result.status).toBe(503);
  expect((await call('get',`/api/customers/${customer}/wallet`)).body.balance_cents).toBe(1000);
  const [[stored]]=await db.execute('SELECT status FROM wallet_bookings WHERE id=?',[booking]);expect(stored.status).toBe('pending');
  const [[income]]=await db.execute('SELECT COUNT(*) AS count FROM provider_income WHERE handyman_id=?',[provider]);expect(income.count).toBe(0);
  expect((await pay('rollback-test')).status).toBe(201);
});

 test('registration needs API key, but no bearer, and preserves existing booking',async()=>{
 const path='/api/bookings/'+(booking+1), body={customer_id:customer,handyman_id:provider,amount_cents:700};
 expect((await require('supertest')(app).put(path).send(body)).status).toBe(401);
 expect((await request(app).put(path).set('X-API-Key','wrong').send(body)).status).toBe(401);
 expect((await request(app).put(path).send(body)).status).toBe(201);
 expect((await request(app).put(path).send({...body,amount_cents:1})).status).toBe(409);
 const [[row]]=await db.execute('SELECT amount_cents FROM wallet_bookings WHERE id=?',[booking+1]);expect(row.amount_cents).toBe(700);
 await topup();expect((await call('post',path+'/pay',{},'registered-pay')).status).toBe(201);
 });
 test('registration validates fields and foreign IDs',async()=>{
 const path='/api/bookings/'+(booking+1), body={customer_id:customer,handyman_id:provider,amount_cents:700};
 for(const invalid of [{}, {...body,amount_cents:-1},{...body,amount_cents:1.5},{...body,customer_id:String(customer)},{...body,extra:1}]) expect((await request(app).put(path).send(invalid)).status).toBe(400);
 expect((await request(app).put(path).send({...body,customer_id:2147483647})).status).toBe(404);
 expect((await request(app).put(path).send({...body,handyman_id:2147483647})).status).toBe(404);
 const results=await Promise.all([request(app).put(path).send(body),request(app).put(path).send(body)]);expect(results.map(r=>r.status).sort()).toEqual([201,409]);
 });
