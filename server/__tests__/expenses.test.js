const request = require('supertest');
const { createApp } = require('../app');
const db = require('../db');

let connection;
let app;

const validExpense = {
  description: 'Week 7 test expense',
  category: 'Transport',
  amount: 125.50,
  expense_date: '2026-09-29'
};

beforeAll(async () => {
  connection = await db.getConnection();
  app = createApp(connection);
});

beforeEach(async () => {
  await connection.beginTransaction();
});

afterEach(async () => {
  if (connection) {
    await connection.rollback();
  }
});

afterAll(async () => {
  if (connection) {
    connection.release();
  }
  await db.end();
});

describe('POST /api/expenses', () => {
  test('creates a valid expense and returns the saved fields', async () => {
    const response = await request(app)
      .post('/api/expenses')
      .send(validExpense);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      id: expect.any(Number),
      ...validExpense
    });
    expect(response.body.id).toBeGreaterThan(0);

    const readback = await request(app).get('/api/expenses');

    expect(readback.status).toBe(200);
    expect(readback.body).toContainEqual(response.body);
  });

  test.each([
    'description',
    'category',
    'amount',
    'expense_date'
  ])('rejects a missing %s without saving a record', async field => {
    const body = { ...validExpense };
    delete body[field];

    const before = await request(app).get('/api/expenses');
    expect(before.status).toBe(200);

    const response = await request(app)
      .post('/api/expenses')
      .send(body);

    expect(response.status).toBe(400);
    expect(response.body.error).toEqual(expect.any(String));
    expect(response.body.error.length).toBeGreaterThan(0);

    const after = await request(app).get('/api/expenses');
    expect(after.status).toBe(200);
    expect(after.body).toEqual(before.body);
  });

  test.each([
    ['wrong amount type', { amount: '125.50' }],
    ['negative amount', { amount: -10 }],
    ['zero amount', { amount: 0 }],
    ['too many decimal places', { amount: 1.001 }],
    ['blank description', { description: '   ' }],
    ['invalid date', { expense_date: '2026-02-30' }],
    ['unsupported category', { category: 'Invalid' }]
  ])('rejects %s without saving a record', async (_, changes) => {
    const before = await request(app).get('/api/expenses');
    expect(before.status).toBe(200);

    const response = await request(app)
      .post('/api/expenses')
      .send({ ...validExpense, ...changes });

    expect(response.status).toBe(400);
    expect(response.body.error).toEqual(expect.any(String));

    const after = await request(app).get('/api/expenses');
    expect(after.status).toBe(200);
    expect(after.body).toEqual(before.body);
  });

  test('accepts the minimum amount of 0.01', async () => {
    const response = await request(app)
      .post('/api/expenses')
      .send({ ...validExpense, amount: 0.01 });

    expect(response.status).toBe(201);
    expect(response.body.amount).toBe(0.01);
  });
});

describe('Local expense list and /api/local/expenses writes', () => {
  async function createExpense() {
    const response = await request(app).post('/api/expenses').send(validExpense);
    expect(response.status).toBe(201);
    return response.body;
  }

  test('GET returns an empty array when the table is empty', async () => {
    await connection.execute('DELETE FROM expenses');
    const response = await request(app).get('/api/expenses');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  test('PATCH persists a partial update, preserves other fields, and is repeatable', async () => {
    const saved = await createExpense();
    for (let i = 0; i < 2; i++) {
      const response = await request(app).patch(`/api/local/expenses/${saved.id}`).send({amount:25});
      expect(response.status).toBe(200);
      expect(response.body).toEqual({...saved,amount:25});
    }
    const response = await request(app).get('/api/expenses');
    expect(response.status).toBe(200);
    expect(response.body).toContainEqual({...saved,amount:25});
  });

  test.each([{}, [], {amount:'25'}, {amount:-1}, {description:''}, {expense_date:'2026-02-30'}, {category:'invalid'}, {id:5}])('PATCH rejects %j and preserves data', async body => {
    const saved = await createExpense();
    const response = await request(app).patch(`/api/local/expenses/${saved.id}`).send(body);
    expect(response.status).toBe(400);
    expect(response.body.error).toEqual(expect.any(String));
    const readback = await request(app).get('/api/expenses');
    expect(readback.status).toBe(200);
    expect(readback.body).toContainEqual(saved);
  });

  test('DELETE removes the row, returns an empty body, and missing-resource operations return 404', async () => {
    const saved = await createExpense();
    const response = await request(app).delete(`/api/local/expenses/${saved.id}`);
    expect(response.status).toBe(204);
    expect(response.text).toBe('');
    const readback = await request(app).get('/api/expenses');
    expect(readback.status).toBe(200);
    expect(readback.body.some(row => row.id === saved.id)).toBe(false);
    for (const method of ['patch','delete']) {
      const missing = await request(app)[method](`/api/local/expenses/${saved.id}`).send({amount:30});
      expect(missing.status).toBe(404);
      expect(missing.body).toEqual({error:'Expense not found.'});
    }
  });

  test.each(['abc','0','-1','1.5'])('rejects invalid ID %s', async id => {
    for (const method of ['patch','delete']) {
      const response = await request(app)[method](`/api/local/expenses/${id}`).send({amount:30});
      expect(response.status).toBe(400);
      expect(response.body.error).toEqual(expect.any(String));
    }
  });
});
