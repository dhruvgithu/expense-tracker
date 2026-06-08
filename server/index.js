const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// In-memory storage
let expenses = [];

// GET all expenses
app.get('/api/expenses', (req, res) => {
  const sorted = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(sorted);
});

// POST new expense
app.post('/api/expenses', (req, res) => {
  const { amount, category, date, note } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }
  if (!category) {
    return res.status(400).json({ error: 'Category is required' });
  }
  if (!date) {
    return res.status(400).json({ error: 'Date is required' });
  }

  const expense = {
    id: uuidv4(),
    amount: parseFloat(amount),
    category,
    date,
    note: note || '',
    createdAt: new Date().toISOString()
  };

  expenses.push(expense);
  res.status(201).json(expense);
});

// PUT update expense
app.put('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  const { amount, category, date, note } = req.body;

  const index = expenses.findIndex(e => e.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  expenses[index] = { ...expenses[index], amount: parseFloat(amount), category, date, note };
  res.json(expenses[index]);
});

// DELETE expense
app.delete('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  const index = expenses.findIndex(e => e.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  expenses.splice(index, 1);
  res.json({ message: 'Deleted successfully' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});