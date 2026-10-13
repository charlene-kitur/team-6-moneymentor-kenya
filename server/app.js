const express = require('express');
const cors = require('cors');
const categories = ['Housing', 'Food', 'Transport', 'Utilities', 'Education', 'Health', 'Other'];
function validExpense(body) {
  if (!body || typeof body.description !== 'string' || !body.description.trim() || body.description.trim().length > 200) return false;
  if (!categories.includes(body.category) || typeof body.amount !== 'number' || !Number.isFinite(body.amount) || body.amount <= 0 || body.amount > 9999999999.99 || Math.abs(body.amount * 100 - Math.round(body.amount * 100)) > 0.0001) return false;
  if (typeof body.expense_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(body.expense_date) || body.expense_date < '1000-01-01') return false;
  const date = new Date(body.expense_date);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === body.expense_date;
}
function createApp(db, options = {}) {
  const app = express();
  app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000' }));
  app.use(express.json({ limit: '16kb' }));
  app.get('/', (req, res) => res.json({ message: 'MoneyMentor API is running' }));
  app.get('/api/health', async (req, res, next) => {
    try { await db.query('SELECT 1'); res.json({ status: 'ok', database: 'connected' }); } catch (error) { next(error); }
  });
  app.get('/api/expenses', async (req, res, next) => {
    try {
      const [rows] = await db.query('SELECT id, description, category, amount, expense_date FROM expenses ORDER BY expense_date DESC, id DESC');
      res.json(rows);
    } catch (error) { next(error); }
  });
  app.post('/api/expenses', async (req, res, next) => {
    if (!validExpense(req.body)) return res.status(400).json({ error: 'Enter a description, category, positive amount (up to two decimals), and valid date.' });
    const { description, category, amount, expense_date } = req.body;
    try {
      const [result] = await db.execute('INSERT INTO expenses (description, category, amount, expense_date) VALUES (?, ?, ?, ?)', [description.trim(), category, amount, expense_date]);
      res.status(201).json({ id: result.insertId, description: description.trim(), category, amount, expense_date });
    } catch (error) { next(error); }
  });
  app.delete('/api/local/expenses/:expenseId', async (req, res, next) => {
    const { expenseId } = req.params;

    if (!/^[1-9]\d*$/.test(expenseId)) {
      return res.status(400).json({
        error: 'Expense ID must be a positive integer.'
      });
    }

    try {
      const [result] = await db.execute(
        'DELETE FROM expenses WHERE id = ?',
        [expenseId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          error: 'Expense not found.'
        });
      }

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  });
    app.patch('/api/local/expenses/:expenseId', async (req, res, next) => {
    const { expenseId } = req.params;
    const body = req.body;
    const allowedFields = [
      'description', 'category', 'amount', 'expense_date'
    ];

    if (!/^[1-9]\d*$/.test(expenseId)) {
      return res.status(400).json({
        error: 'Expense ID must be a positive integer.'
      });
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return res.status(400).json({
        error: 'Send a JSON object containing the fields to update.'
      });
    }

    const fields = Object.keys(body);

    if (
      fields.length === 0 ||
      fields.some(field => !allowedFields.includes(field))
    ) {
      return res.status(400).json({
        error: 'Supply at least one valid expense field.'
      });
    }

    // Defaults allow the existing validator to check a partial update.
    // Only fields supplied in the request are saved.
    const validationData = {
      description: 'Validation placeholder',
      category: 'Other',
      amount: 1,
      expense_date: '2026-01-01',
      ...body
    };

    if (!validExpense(validationData)) {
      return res.status(400).json({
        error: 'Check the description, category, amount, and date.'
      });
    }

    try {
      const [existing] = await db.execute(
        'SELECT id FROM expenses WHERE id = ?',
        [expenseId]
      );

      if (existing.length === 0) {
        return res.status(404).json({
          error: 'Expense not found.'
        });
      }

      // Field names come only from the allowlist above.
      const assignments = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field =>
        field === 'description' ? body[field].trim() : body[field]
      );

      await db.execute(
        `UPDATE expenses SET ${assignments} WHERE id = ?`,
        [...values, expenseId]
      );

      const [updated] = await db.execute(
        'SELECT id, description, category, amount, expense_date FROM expenses WHERE id = ?',
        [expenseId]
      );

      if (updated.length === 0) {
        return res.status(404).json({
          error: 'Expense not found.'
        });
      }

      return res.status(200).json(updated[0]);
    } catch (error) {
      next(error);
    }
  });
  const money = (value, positive = false) => typeof value === 'number' && Number.isFinite(value) && value >= (positive ? 0.01 : 0) && value <= 9999999999.99 && Math.abs(value * 100 - Math.round(value * 100)) < 0.0001;
  for (const resource of [
    { path: 'budgets', table: 'budgets', fields: ['income', 'fixed', 'variable'] },
    { path: 'savings-goals', table: 'savings_goals', fields: ['goal_amount', 'monthly_save'] }
  ]) {
    app.get(`/api/${resource.path}`, async (req, res, next) => {
      try {
        const [rows] = await db.query(`SELECT id, ${resource.fields.join(', ')}, created_at FROM ${resource.table} ORDER BY id DESC`);
        res.json(rows);
      } catch (error) { next(error); }
    });
    app.post(`/api/${resource.path}`, async (req, res, next) => {
      const body = req.body || {};
      if (!resource.fields.every((field, index) => money(body[field], resource.path === 'savings-goals' || index === 0))) return res.status(400).json({ error: 'Enter valid amounts with up to two decimal places. Income and savings amounts must be positive; expenses cannot be negative.' });
      try {
        const values = resource.fields.map(field => body[field]);
        const [result] = await db.execute(`INSERT INTO ${resource.table} (${resource.fields.join(', ')}) VALUES (${values.map(() => '?').join(', ')})`, values);
        res.status(201).json({ id: result.insertId, ...Object.fromEntries(resource.fields.map(field => [field, body[field]])) });
      } catch (error) { next(error); }
    });
  }
  app.post('/api/questions', async (req, res, next) => {
    const { name, email, question } = req.body || {};
    if (typeof name !== 'string' || !name.trim() || name.trim().length > 100 || typeof email !== 'string' || email.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || typeof question !== 'string' || !question.trim() || question.trim().length > 5000) return res.status(400).json({ error: 'Enter a name (up to 100 characters), valid email, and question (up to 5000 characters).' });
    try {
      const [result] = await db.execute('INSERT INTO contact_questions (name, email, question) VALUES (?, ?, ?)', [name.trim(), email.trim(), question.trim()]);
      res.status(201).json({ id: result.insertId, message: 'Question saved.' });
    } catch (error) { next(error); }
  });
  require('./provider-api').mountProviderApi(app, db, options);
  app.use('/api', (req, res) => res.status(404).json({ error: 'API route not found' }));
  app.use((error, req, res, next) => {
    if (error.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body' });
    if (error.type === 'entity.too.large') return res.status(413).json({ error: 'Request is too large' });
    console.error('API error details:', error.code, error.message);
    if (error.code === 'ER_TABLEACCESS_DENIED_ERROR') {
      return res.status(500).json({ error: 'Database permissions are not configured for this operation.' });
    }
    res.status(503).json({ error: 'Database unavailable. Check that MySQL is running and the database has been set up.' });
  });
  return app;
}
module.exports = { createApp, validExpense };
