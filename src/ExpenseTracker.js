import React, { useCallback, useEffect, useState } from 'react';

const API_URL = 'http://localhost:5000/api';
const HANDYMAN_ID = 1;

const createEmptyForm = () => ({
  category: '',
  description: '',
  amount: '',
  expenseDate: new Date().toISOString().slice(0, 10),
});

function ExpenseTracker() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState(createEmptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        `${API_URL}/handymen/${HANDYMAN_ID}/expenses`
      );

      if (!response.ok) {
        throw new Error('Failed to load expenses');
      }

      const data = await response.json();
      setExpenses(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');

      const url = editingId
        ? `${API_URL}/expenses/${editingId}`
        : `${API_URL}/handymen/${HANDYMAN_ID}/expenses`;

      const response = await fetch(url, {
        method: editingId ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save expense');
      }

      setForm(createEmptyForm());
      setEditingId(null);
      await loadExpenses();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const beginEditing = (expense) => {
    setEditingId(expense.id);

    setForm({
      category: expense.category,
      description: expense.description || '',
      amount: expense.amount,
      expenseDate: String(expense.expense_date).slice(0, 10),
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setForm(createEmptyForm());
    setError('');
  };

  const totalExpenses = expenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0
  );

  return (
    <section id="expenses">
      <div className="container">
        <h2 className="section-title text-center">
          Expense Tracker
        </h2>

        <p className="section-sub text-center mx-auto">
          Record and update expenses stored in the MoneyMentor database.
        </p>

        <div className="planner-grid">
          <form className="planner-card" onSubmit={handleSubmit}>
            <h3>{editingId ? 'Update Expense' : 'Add Expense'}</h3>

            <div className="form-group">
              <label htmlFor="expense-category">Category</label>
              <input
                id="expense-category"
                name="category"
                type="text"
                value={form.category}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="expense-description">Description</label>
              <input
                id="expense-description"
                name="description"
                type="text"
                value={form.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="expense-amount">Amount (KSh)</label>
              <input
                id="expense-amount"
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="expense-date">Expense Date</label>
              <input
                id="expense-date"
                name="expenseDate"
                type="date"
                value={form.expenseDate}
                onChange={handleChange}
                required
              />
            </div>

            {error && <p className="error-text">{error}</p>}

            <button className="btn" type="submit" disabled={saving}>
              {saving
                ? 'Saving...'
                : editingId
                  ? 'Update Expense'
                  : 'Add Expense'}
            </button>

            {editingId && (
              <button
                className="btn btn-outline"
                type="button"
                onClick={cancelEditing}
                style={{ marginLeft: '10px' }}
              >
                Cancel
              </button>
            )}
          </form>

          <div className="planner-card">
            <h3>Saved Expenses</h3>

            {loading && <p>Loading expenses...</p>}

            {!loading && expenses.length === 0 && (
              <p>No expenses have been recorded yet.</p>
            )}

            {expenses.map((expense) => (
              <div
                key={expense.id}
                style={{
                  padding: '12px 0',
                  borderBottom: '1px solid var(--border-color)',
                }}
              >
                <strong>{expense.category}</strong>

                <p>{expense.description || 'No description'}</p>

                <p>
                  KSh {Number(expense.amount).toLocaleString()} —{' '}
                  {String(expense.expense_date).slice(0, 10)}
                </p>

                <button
                  className="btn btn-outline"
                  type="button"
                  onClick={() => beginEditing(expense)}
                >
                  Edit
                </button>
              </div>
            ))}

            <p style={{ marginTop: '20px', fontWeight: 'bold' }}>
              Total: KSh {totalExpenses.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ExpenseTracker;