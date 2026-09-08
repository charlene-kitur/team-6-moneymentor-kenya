# MoneyMentor database and Express API

This implements the React → Express → MySQL database layer from the lab guide, using MoneyMentor expenses instead of the example students table. The existing React app remains at the repository root. This commit adds only the backend/database files; it does not change the website UI.

## Set up

1. Install and start MySQL locally.
2. Open a terminal in `server` and run `npm ci`.
3. Copy `.env.example` to `.env`. Enter your local MySQL host, port, username and password. Use `moneymentor_kenya` for DB_NAME. The database account needs permission to create that database and its tables, select rows, and insert rows.
4. Run `npm run db:setup`. This creates the database and the tables in `schema.sql`. Three labelled sample expenses are inserted only when the expense table is empty. Existing data is preserved.
5. Run `npm run dev` (or `npm start`). The API listens on http://localhost:5000.
6. Open http://localhost:5000/api/health to check the connection, then http://localhost:5000/api/expenses to see rows from MySQL as JSON.

The React app runs separately from the repository root with `npm start`. A React component can fetch `http://localhost:5000/api/expenses`, following Step 7 of the guide. CORS permits http://localhost:3000 by default; configure CLIENT_ORIGIN in `.env` if necessary.

## Tables and endpoints

- `expenses`: GET and POST `/api/expenses`; fields description, category, amount, expense_date (YYYY-MM-DD). Categories: Housing, Food, Transport, Utilities, Education, Health, Other.
- `budgets`: GET and POST `/api/budgets`; fields income, fixed, variable.
- `savings_goals`: GET and POST `/api/savings-goals`; fields goal_amount, monthly_save.
- `contact_questions`: POST `/api/questions`; fields name, email, question. Returns a saved question ID. No email is sent.

POST requests use JSON. Monetary values must be numbers with at most two decimal places. Routes validate input and use parameterized inserts. GET routes return arrays; successful inserts return HTTP 201.

`db.js` creates a mysql2 connection pool using dotenv configuration. `index.js` starts Express; `app.js` defines the routes and JSON error handling. `schema.sql` defines the tables; `setup-db.js` creates the database and executes that schema.

## Tests

After database setup, run `npm test` in `server`. Tests check validation, real MySQL save/readback, malformed JSON and database failure responses. Test records are rolled back.

## Files to keep private

Do not commit `.env`, `.env.admin`, `node_modules`, or MySQL's `data` folder. The included `.gitignore` excludes these. Each teammate creates their own database from `schema.sql` with `npm run db:setup`; GitHub does not run MySQL or store live database records.

This is a local single-user lab backend. Provider authentication and authorization from the team API planning documents are not part of this implementation; do not expose it as a public multi-user service.
