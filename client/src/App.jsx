import { useState, useEffect } from 'react'
import axios from 'axios'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './App.css'

const API = 'http://localhost:3001/api'

const CATEGORIES = ['Food', 'Transport', 'Bills', 'Entertainment', 'Other']
const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6']

export default function App() {
  const [expenses, setExpenses] = useState([])
  const [form, setForm] = useState({ amount: '', category: '', date: '', note: '' })
  const [editId, setEditId] = useState(null)
  const [filterCategory, setFilterCategory] = useState('All')
  const [filterMonth, setFilterMonth] = useState('this')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    setLoading(true)
    const res = await axios.get(`${API}/expenses`)
    setExpenses(res.data)
    setLoading(false)
  }

  const handleSubmit = async () => {
    setError('')
    if (!form.amount || form.amount <= 0) return setError('Amount must be positive')
    if (!form.category) return setError('Category is required')
    if (!form.date) return setError('Date is required')
    if (new Date(form.date) > new Date()) return setError('Future dates not allowed')

    try {
      if (editId) {
        await axios.put(`${API}/expenses/${editId}`, form)
        setEditId(null)
      } else {
        await axios.post(`${API}/expenses`, form)
      }
      setForm({ amount: '', category: '', date: '', note: '' })
      fetchExpenses()
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return
    await axios.delete(`${API}/expenses/${id}`)
    fetchExpenses()
  }

  const handleEdit = (expense) => {
    setEditId(expense.id)
    setForm({ amount: expense.amount, category: expense.category, date: expense.date, note: expense.note })
  }

  const filtered = expenses.filter(e => {
    const now = new Date()
    const d = new Date(e.date)
    const categoryMatch = filterCategory === 'All' || e.category === filterCategory
    let monthMatch = true
    if (filterMonth === 'this') monthMatch = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    if (filterMonth === 'last') {
      const last = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      monthMatch = d.getMonth() === last.getMonth() && d.getFullYear() === last.getFullYear()
    }
    return categoryMatch && monthMatch
  })

  const totalThisMonth = expenses.filter(e => {
    const d = new Date(e.date)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).reduce((sum, e) => sum + e.amount, 0)

  const highestExpense = expenses.reduce((max, e) => e.amount > max ? e.amount : max, 0)

  const categoryTotals = CATEGORIES.map(cat => ({
    name: cat,
    value: expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0)
  })).filter(c => c.value > 0)

  return (
    <div className="container">
      <h1>💸 Expense Tracker</h1>

      {/* Summary */}
      <div className="summary">
        <div className="summary-card">
          <p>This Month</p>
          <h2>₹{totalThisMonth.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
        </div>
        <div className="summary-card">
          <p>Highest Expense</p>
          <h2>₹{highestExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
        </div>
        <div className="summary-card">
          <p>Total Entries</p>
          <h2>{expenses.length}</h2>
        </div>
      </div>

      {/* Chart */}
      {categoryTotals.length > 0 && (
        <div className="chart-box">
          <h3>Spending by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={categoryTotals} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {categoryTotals.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(val) => `₹${val.toLocaleString('en-IN')}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Form */}
      <div className="form-box">
        <h3>{editId ? 'Edit Expense' : 'Add Expense'}</h3>
        {error && <p className="error">{error}</p>}
        <div className="form-row">
          <input type="number" placeholder="Amount (₹)" value={form.amount}
            onChange={e => setForm({ ...form, amount: e.target.value })} />
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
            <option value="">Select Category</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <input type="date" value={form.date} max={new Date().toISOString().split('T')[0]}
            onChange={e => setForm({ ...form, date: e.target.value })} />
          <input type="text" placeholder="Note (optional)" value={form.note}
            onChange={e => setForm({ ...form, note: e.target.value })} />
          <button onClick={handleSubmit}>{editId ? 'Update' : 'Add'}</button>
          {editId && <button onClick={() => { setEditId(null); setForm({ amount: '', category: '', date: '', note: '' }) }}>Cancel</button>}
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="All">All Categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
          <option value="this">This Month</option>
          <option value="last">Last Month</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Expenses List */}
      {loading ? <p className="center">Loading...</p> : filtered.length === 0 ? (
        <div className="empty">
          <p>No expenses found 🎉</p>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Note</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => (
              <tr key={e.id}>
                <td>{e.date}</td>
                <td><span className={`badge ${e.category.toLowerCase()}`}>{e.category}</span></td>
                <td>₹{parseFloat(e.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td>{e.note || '-'}</td>
                <td>
                  <button className="edit-btn" onClick={() => handleEdit(e)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(e.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}