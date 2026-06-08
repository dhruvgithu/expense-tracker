# 💸 Expense Tracker

A full-stack expense tracking application built with Node.js + Express (backend) and React + Vite (frontend). Users can log daily expenses across categories, view summaries, and visualize spending with charts.

## Live Demo
- Frontend: (add after deployment)
- Backend: (add after deployment)

## Tech Stack

### Backend
- **Node.js + Express** — simple, lightweight REST API
- **uuid** — unique IDs for each expense
- **cors** — allow frontend to talk to backend
- **In-memory array** — storage (no database setup needed)

### Frontend
- **React + Vite** — fast development setup
- **Axios** — HTTP requests to backend
- **Recharts** — pie chart for spending by category
- **Plain CSS** — custom styling, no component library

## How to Run Locally

Make sure you have Node.js installed.

### 1. Clone the repo
```bash
git clone <your-repo-url>
cd expense-tracker
```

### 2. Start the backend
```bash
cd server
npm install
node index.js
```
Server runs on http://localhost:3001

### 3. Start the frontend
```bash
cd client
npm install
npm run dev
```
Frontend runs on http://localhost:5173

## API Documentation

### GET /api/expenses
Returns all expenses sorted by date (newest first).
- **Response:** `[{ id, amount, category, date, note, createdAt }]`

### POST /api/expenses
Add a new expense.
- **Body:** `{ amount, category, date, note }`
- **Response:** `{ id, amount, category, date, note, createdAt }`

### PUT /api/expenses/:id
Update an existing expense.
- **Body:** `{ amount, category, date, note }`
- **Response:** updated expense object

### DELETE /api/expenses/:id
Delete an expense.
- **Response:** `{ message: "Deleted successfully" }`

## Project Structure