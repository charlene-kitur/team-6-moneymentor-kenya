const request = require('supertest');
const { createApp } = require('../app');
const db = require('../db');
let connection, app;
beforeAll(async () => { connection = await db.getConnection(); app = createApp(connection); });
beforeEach(async () => { await connection.beginTransaction(); });
afterEach(async () => { if (connection) await connection.rollback(); });
afterAll(async () => { if (connection) connection.release(); await db.end(); });

const payload = {name:'Week 7 test',email:'test@example.com',question:'How can I save?'};
describe('POST /api/questions', () => {
 test('saves a question and returns a reference', async () => {
  const response = await request(app).post('/api/questions').send(payload);
  expect(response.status).toBe(201);
  expect(response.body).toEqual({id:expect.any(Number),message:'Question saved.'});
  const [[row]] = await connection.execute('SELECT name,email,question FROM contact_questions WHERE id = ?', [response.body.id]);
  expect(row).toEqual(payload);
 });
 test.each(['name','email','question'])('rejects missing, blank and wrong-type %s without saving', async field => {
  const [[before]] = await connection.query('SELECT COUNT(*) AS count FROM contact_questions');
  const missing = {...payload}; delete missing[field];
  for (const body of [missing,{...payload,[field]:''},{...payload,[field]:123}]) {
   const response = await request(app).post('/api/questions').send(body);
   expect(response.status).toBe(400);
   expect(response.body.error).toEqual(expect.any(String));
  }
  const [[after]] = await connection.query('SELECT COUNT(*) AS count FROM contact_questions');
  expect(after.count).toBe(before.count);
 });
 test('rejects malformed email', async () => {
  const response = await request(app).post('/api/questions').send({...payload,email:'invalid'});
  expect(response.status).toBe(400);
  expect(response.body.error).toEqual(expect.any(String));
 });
 test('accepts maximum name and question lengths', async () => {
  const response = await request(app).post('/api/questions').send({...payload,name:'a'.repeat(100),question:'a'.repeat(5000)});
  expect(response.status).toBe(201);
  const [[row]] = await connection.execute('SELECT name,question FROM contact_questions WHERE id = ?', [response.body.id]);
  expect(row.name).toHaveLength(100); expect(row.question).toHaveLength(5000);
 });
});
