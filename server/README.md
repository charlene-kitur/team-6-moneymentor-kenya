## Week 8 quickstart and offline reference

For a clean clone, use the [root README](../README.md). It includes the isolated
demo setup, token commands and the current request/response examples. Open
[docs/index.html](../docs/index.html) directly in a browser for the offline API
reference. `npm.cmd run docs:build` regenerates it; with the demo API running,
`npm.cmd run docs:verify` checks the examples. The older setup notes below apply
to the normal project database, not the isolated demo.

# MoneyMentor API ? local setup and Week 7 tests

## Existing computer
MySQL uses the original project's data folder on port 3307. Keep its terminal
running. The cloned server/.env points to that database and is ignored by Git.
No credentials or tokens belong in documentation or commits.

From this server folder:

```powershell
npm.cmd ci
npm.cmd test
npm.cmd run test:legacy
npm.cmd start
```

Jest starts Express on temporary ports, so it does not require npm start.
Tests use real MySQL transactions and roll back fixtures, including fixture
providers. Auto-increment counters can advance. Use only a development database
and avoid simultaneous manual writes while running tests.

## New computer / database
1. Install MySQL and dependencies, copy .env.example to .env and fill in values.
2. Generate a random signing secret with
   `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
   and save it as JWT_SECRET in the ignored .env. Do not use the placeholder.
3. Using an administrator-configured setup environment, run `npm.cmd run db:setup`.
   setup-db.js loads schema.sql and provider-schema.sql using CREATE TABLE IF
   NOT EXISTS. Existing rows are preserved; local sample expenses are added only
   if the local expenses table is empty.
4. Configure the runtime account for the resulting tables. For this local lab,
   it needs SELECT, INSERT, UPDATE and DELETE on provider tables (tests insert
   their own fixtures), plus the existing permissions on local tracker tables.
   Perform grants as an administrator; do not run the API as root.
5. Restore runtime credentials before starting the API or running tests.

## Provider contract and data
openapi.yaml is the current consumer contract. See ../WALLET_INTEGRATION.md for simulated wallets, trusted booking registration, customer JWTs and idempotency. Provider income/expense routes use a handyman subject. Wallet routes require a customer subject and role=customer. All consumer routes require an API key.

For manual local development, an administrator can create a provider and issue
an expiring token using the CLI:

```powershell
node provider-admin.js create "Demo provider"
node provider-admin.js token PROVIDER_ID
```

Replace PROVIDER_ID with the printed ID. Treat the resulting token as private;
use Authorization: Bearer TOKEN in Postman/Swagger. This is local provisioning,
not a production login or an integration with a live HandyNear identity service.

GET income summaries sum provider_income and provider_expenses by month.
Provider savings and investment routes are retired. Booking payments add simulated provider income atomically with wallet deductions. Existing historical tables are retained.

## Local React compatibility
The unauthenticated local tracker uses separate tables:
- GET/POST /api/expenses
- PATCH/DELETE /api/local/expenses/{expenseId}
- GET/POST /api/budgets and /api/savings-goals
- POST /api/questions
- GET / and /api/health

React's editing URL was updated. /api/expenses/{expenseId} now belongs to the
JWT-protected provider contract. Local and provider IDs are independent. The
local routes cannot read or mutate provider tables. This server binds to
127.0.0.1 and the unauthenticated local extensions are for the local lab only.

## Week 7 boundaries
Only Parts A and B are being completed. No partner exchange or partner results
were created. Nothing has been committed or pushed by this work.
