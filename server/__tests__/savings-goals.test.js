const request = require('supertest');
const { createApp } = require('../app');
const db = require('../db');
let connection, app;
beforeAll(async () => { connection = await db.getConnection(); app = createApp(connection); });
beforeEach(async () => { await connection.beginTransaction(); });
afterEach(async () => { if (connection) await connection.rollback(); });
afterAll(async () => { if (connection) connection.release(); await db.end(); });

const resource = 'savings-goals';
const payload = {goal_amount:100000,monthly_save:5000};

describe(resource, () => {
 test('POST saves the exact fields and GET reads them back', async () => {
  const response = await request(app).post('/api/'+resource).send(payload);
  expect(response.status).toBe(201);
  expect(response.body).toEqual({id:expect.any(Number),...payload});
  const readback = await request(app).get('/api/'+resource);
  expect(readback.status).toBe(200);
  expect(Array.isArray(readback.body)).toBe(true);
  expect(readback.body).toContainEqual({...response.body,created_at:expect.any(String)});
 });
 test.each(Object.keys(payload))('rejects missing or wrong-type %s without writing', async field => {
  const before = await request(app).get('/api/'+resource);
  expect(before.status).toBe(200);
  const missing = {...payload}; delete missing[field];
  for (const body of [missing,{...payload,[field]:'100'},{...payload,[field]:-1}]) {
   const response = await request(app).post('/api/'+resource).send(body);
   expect(response.status).toBe(400);
   expect(response.body.error).toEqual(expect.any(String));
  }
  const after = await request(app).get('/api/'+resource);
  expect(after.status).toBe(200);
  expect(after.body).toEqual(before.body);
 });
 test('accepts the minimum supported amounts', async () => {
  const body = resource === 'budgets' ? {income:0.01,fixed:0,variable:0} : {goal_amount:0.01,monthly_save:0.01};
  const response = await request(app).post('/api/'+resource).send(body);
  expect(response.status).toBe(201);
  expect(response.body).toEqual({id:expect.any(Number),...body});
 });
});
