const request = require('supertest');
const { createApp } = require('../app');
const db = require('../db');
let connection, app;
beforeAll(async () => { connection = await db.getConnection(); app = createApp(connection); });
beforeEach(async () => { await connection.beginTransaction(); });
afterEach(async () => { if (connection) await connection.rollback(); });
afterAll(async () => { if (connection) connection.release(); await db.end(); });

test('GET / returns the API welcome message', async () => {
 const response = await request(app).get('/');
 expect(response.status).toBe(200);
 expect(response.body).toEqual({message:'MoneyMentor API is running'});
});
test('GET /api/health verifies real database connectivity', async () => {
 const response = await request(app).get('/api/health');
 expect(response.status).toBe(200);
 expect(response.body).toEqual({status:'ok',database:'connected'});
});
test('unknown API route returns a JSON 404', async () => {
 const response = await request(app).get('/api/does-not-exist');
 expect(response.status).toBe(404);
 expect(response.body).toEqual({error:'API route not found'});
});
test('malformed JSON is rejected', async () => {
 const response = await request(app).post('/api/expenses').set('Content-Type','application/json').send('{');
 expect(response.status).toBe(400);
 expect(response.body).toEqual({error:'Invalid JSON body'});
});
