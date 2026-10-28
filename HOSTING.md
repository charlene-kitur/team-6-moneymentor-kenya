# Hosting and consumer sample data

Status: prepared locally, not deployed. No permanent URL exists yet.

## Deployment target
Use an account-backed Node.js service and persistent MySQL database. Railway
supports this combination. An active account and sufficient hosting credit are
required; a trial is not a guarantee of permanent free operation.

Service root: server
Build/install: npm ci --omit=dev
Start: npm start
Health check: /api/health
Set HOST=0.0.0.0 and use the platform's PORT.
Configure DB_HOST, DB_PORT, DB_USER, DB_PASSWORD and DB_NAME for the hosted
MySQL service, not the laptop. Configure a new private JWT_SECRET of at least
32 random bytes, JWT_ISSUER, JWT_AUDIENCE and the actual CLIENT_ORIGIN.
Never commit these values or upload local .env files.

Before public use, initialize the hosted database with server/schema.sql and
server/provider-schema.sql using its administration connection. Use an
application database account with SELECT, INSERT, UPDATE and DELETE privileges.
Then run from server, with hosted environment variables:

    node seed-consumer-demo.js

The sample script inserts dedicated fictional providers and preserves existing
ones on rerun. Read its output for actual IDs; cloud IDs may differ from local.
Generate a platform public HTTPS domain and verify /api/health plus authenticated
consumer routes before sharing. Do not share the database connection address.

## Verified local samples (22 October 2026)
Target: isolated .env.demo database; existing records preserved.
Provider 210: Sample: Amani Plumbing; October income 45000, expenses 6500,
net 38500; savings 24000 / 60000 = 40%.
Provider 211: Sample: Baraka Electrical; October income 62000, expenses 8500,
net 53500; savings 35000 / 100000 = 35%.
Both: investment initial 10000, monthly contribution 2000, annual rate 8%,
3 years; API projected value 93773.49. All amounts are fictional examples.

Verified HTTP 200 for each provider's income-summaries?month=2026-10,
savings-goals and investment-projections, using locally generated bearer tokens.
Repeated seeding created no duplicates. Cloud behaviour is not yet verified.

## Consumer paths
Append these paths to the hosted base URL (the /api prefix is required):

GET /api/handymen/{id}/income-summaries?month=2026-10
GET /api/handymen/{id}/savings-goals
GET /api/handymen/{id}/investment-projections
POST /api/handymen/{id}/expenses
PATCH /api/expenses/{expenseId}
DELETE /api/expenses/{expenseId}

Provider routes require Authorization: Bearer <token>, issued for the matching
provider ID. Use the existing provider-admin.js token command on the deployment
with its private JWT configuration; do not give consumers the signing secret.
Opening a protected URL in Chrome without a token returns 401, not the records.
The root URL currently returns a service message, not a data dashboard.
A public read-only sample-data page can be added separately without exposing
private database rows or disabling existing authentication.
