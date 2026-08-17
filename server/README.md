# Expense Tracker — Server

Express + MongoDB API for the expense tracker.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. You need a MongoDB database. Two easy options:
   - **Local**: install MongoDB Community Edition, it runs on `mongodb://localhost:27017` by default.
   - **Free cloud option (easier)**: create a free cluster at mongodb.com/cloud/atlas, then copy the connection string it gives you.

3. Copy `.env.example` to `.env` and set your `MONGO_URI`:
   ```
   cp .env.example .env
   ```

4. Run the server in dev mode (auto-restarts on file changes):
   ```
   npm run dev
   ```

   You should see:
   ```
   MongoDB connected
   Server running on http://localhost:5000
   ```

## API endpoints

| Method | Endpoint                | What it does           |
|--------|--------------------------|-------------------------|
| GET    | /api/health              | Check server is alive   |
| GET    | /api/transactions        | List transactions (supports ?category=, ?account=, ?type=, ?from=, ?to=, ?search=) |
| POST   | /api/transactions        | Create a transaction    |
| PUT    | /api/transactions/:id    | Update a transaction    |
| DELETE | /api/transactions/:id    | Delete a transaction    |

## Example: create a transaction

```
POST http://localhost:5000/api/transactions
Content-Type: application/json

{
  "amount": 450,
  "type": "expense",
  "category": "Food",
  "account": "Bank",
  "date": "2026-08-16",
  "notes": "Swiggy order"
}
```
