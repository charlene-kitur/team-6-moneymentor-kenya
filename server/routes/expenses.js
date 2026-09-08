const express = require('express');
const router = express.Router();
const db = require('../db');

// SELECT expenses belonging to one handyman
router.get('/handymen/:handymanId/expenses', async (req, res) => {
  try {
    const { handymanId } = req.params;

    const [rows] = await db.query(
      `SELECT
          id,
          handyman_id,
          category,
          description,
          amount,
          expense_date,
          created_at,
          updated_at
       FROM expenses
       WHERE handyman_id = ?
       ORDER BY expense_date DESC, id DESC`,
      [handymanId]
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error('SELECT failed:', error);
    res.status(500).json({
      error: 'Failed to retrieve expenses',
    });
  }
});

// INSERT a new expense
router.post('/handymen/:handymanId/expenses', async (req, res) => {
  try {
    const { handymanId } = req.params;
    const { category, description, amount, expenseDate } = req.body;

    const numericAmount = Number(amount);

    if (
      !category ||
      !expenseDate ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      return res.status(400).json({
        error: 'Category, a positive amount and expense date are required',
      });
    }

    const [result] = await db.query(
      `INSERT INTO expenses
         (handyman_id, category, description, amount, expense_date)
       VALUES (?, ?, ?, ?, ?)`,
      [
        handymanId,
        category.trim(),
        description?.trim() || null,
        numericAmount,
        expenseDate,
      ]
    );

    const [rows] = await db.query(
      `SELECT
          id,
          handyman_id,
          category,
          description,
          amount,
          expense_date,
          created_at,
          updated_at
       FROM expenses
       WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('INSERT failed:', error);
    res.status(500).json({
      error: 'Failed to create expense',
    });
  }
});

// UPDATE an existing expense
router.patch('/expenses/:expenseId', async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { category, description, amount, expenseDate } = req.body;

    const numericAmount = Number(amount);

    if (
      !category ||
      !expenseDate ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      return res.status(400).json({
        error: 'Category, a positive amount and expense date are required',
      });
    }

    const [result] = await db.query(
      `UPDATE expenses
       SET category = ?,
           description = ?,
           amount = ?,
           expense_date = ?
       WHERE id = ?`,
      [
        category.trim(),
        description?.trim() || null,
        numericAmount,
        expenseDate,
        expenseId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Expense not found',
      });
    }

    const [rows] = await db.query(
      `SELECT
          id,
          handyman_id,
          category,
          description,
          amount,
          expense_date,
          created_at,
          updated_at
       FROM expenses
       WHERE id = ?`,
      [expenseId]
    );

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('UPDATE failed:', error);
    res.status(500).json({
      error: 'Failed to update expense',
    });
  }
});

module.exports = router;