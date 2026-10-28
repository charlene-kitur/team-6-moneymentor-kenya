# MoneyMentor Kenya API

MoneyMentor Kenya gives HandyNear providers monthly income summaries, expense
management, savings-goal progress and investment projections. The six provider
endpoints use JWT authentication and provider ownership checks. This repository
also contains a separate, local React expense tracker. Follow the API quickstart
below first; the React app is not required to call or test the API.

## Open the API reference ? no installation needed

Download or clone this repository, then double-click **docs/index.html**. It
contains Swagger UI, the OpenAPI document and styles in one file, so it works
offline. Expand any operation for parameters, request examples and response
schemas/examples. GET requests have path/query parameters rather than bodies;
DELETE succeeds with no response body. The page is deliberately read-only:
use the commands below for live calls. GitHub's file viewer displays HTML source;
download the file and open it in a browser to view the rendered page.

- [Offline reference](docs/index.html)
- [OpenAPI source](openapi.yaml)
- [Backend details and existing-project setup](server/README.md)

## Week 8 key-free quickstart - 26 October 2026

Week 9 supersedes the key-free instructions below: all data requests now require X-API-Key. Provider routes also require the existing bearer token.
These API-key-protected local-app endpoints supplement the six protected provider operations;
they do not replace them. For a clean clone, follow setup steps 1-4 below first.
For an existing demo, keep MySQL and npm.cmd run start:demo running.

In a separate PowerShell terminal:

```powershell
$base = 'http://127.0.0.1:5001'
$response = Invoke-WebRequest -UseBasicParsing -Uri "$base/api/health"
$response.StatusCode
$response.Content
```

Captured result on 26 October 2026: HTTP 200

```json
{"status":"ok","database":"connected"}
```

Read general expenses:

```powershell
$response = Invoke-WebRequest -UseBasicParsing -Uri "$base/api/expenses"
$response.StatusCode
$response.Content
```

Captured result: HTTP 200 with 9 records. See the complete actual response in
[verification evidence](docs/WEEK8_KEY_FREE_RESULTS.json). Counts and IDs vary;
an empty list [] is a valid success. Provider records use separate tables.

Test validation without saving a record:

```powershell
try {
    Invoke-WebRequest -UseBasicParsing -Method Post -Uri "$base/api/expenses" -ContentType 'application/json' -Body '{}'
} catch {
    [int]$_.Exception.Response.StatusCode
    $_.ErrorDetails.Message
}
```

Captured result: HTTP 400

```json
{"error":"Enter a description, category, positive amount (up to two decimals), and valid date."}
```

Remote readers must replace $base with the currently verified public base URL,
without /api at the end. localhost refers to the reader's own computer.
Temporary tunnels expire or change: verify the public /api/health before sharing.
Keep the laptop awake and MySQL, API and tunnel running.

Protected provider routes still require bearer tokens. Those checks are deferred
in this pass; existing authenticated examples below are retained as reference.

## Clean-clone quickstart (Windows PowerShell)

### 1. Prerequisites

Install Git, Node.js 22 or newer with npm, and MySQL Community Server 8.0.16 or
newer. MySQL **Server** must be configured and running, not just Workbench.
Know its local administrator username/password and TCP port (normally 3306).
Administrator access is needed once to create a separate demo database and user.
The running API will use a generated non-administrator account.

Check the tools and database port:

```powershell
git --version
node --version
npm.cmd --version
Test-NetConnection 127.0.0.1 -Port 3306
```

If TcpTestSucceeded is False, start your configured MySQL service from Windows
Services, or start your existing local MySQL instance. Substitute its actual
port below. On the original project computer, the separate instance uses 3307.

### 2. Download and install the backend

```powershell
git clone https://github.com/charlene-kitur/team-6-moneymentor-kenya.git
cd team-6-moneymentor-kenya\server
npm.cmd ci
```

If already cloned, open a terminal in that clone's `server` folder instead.
Private repositories require a GitHub account with access. On macOS/Linux use
`npm` instead of `npm.cmd`, forward slashes in paths, and the same server scripts;
the request examples below are specifically PowerShell.

### 3. Configure the one-time database setup

In `server`, create **.env.admin** with your own local MySQL administrator details:

```dotenv
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD="YOUR_LOCAL_MYSQL_ADMIN_PASSWORD"
```

Replace the password and port; do not copy the placeholder literally. This file
is private and ignored by Git. Do not send it to a teammate. Keep an existing
.env.admin if you already have one with the correct credentials.

Run:

```powershell
npm.cmd run demo:setup
```

Expected message: `Demo ready: provider 1, isolated database, API port 5001.`
The script creates **moneymentor_week8_demo**, a random runtime database account,
a random signing secret, and private **server/.env.demo**. It seeds provider 1,
September 2026 income of 5000, one savings goal, and one investment. There are no
expenses initially. It does not change your normal `.env` or existing database.
Setup runs once and refuses to overwrite an existing demo database/config.

### 4. Start the API

In the same terminal:

```powershell
npm.cmd run start:demo
```

Leave this terminal open. Expected URL: **http://localhost:5001**.
The API binds to this computer only; another person's localhost is their own
computer. For another team, give them this local setup or arrange a reachable
API URL separately. No hosted API is provided by cloning GitHub.

### 5. Authenticate and make your first request

Open a **second PowerShell terminal in the same server folder**. Run this block:

<!-- example:session -->
```powershell
$base = 'http://localhost:5001/api'
$token = (node demo-token.js 1).Trim()
$headers = @{ Authorization = "Bearer $token" }
```

`demo-token.js` issues a one-hour token for seeded provider 1, using the private
local signing secret. Keep the token private. If it expires, rerun this block.
For the normal database instead, use `node provider-admin.js token PROVIDER_ID`
and port 5000; do not mix its tokens with the isolated demo.

**One working quickstart request** (after the session block):

<!-- example:quickstart -->
```powershell
(Invoke-WebRequest -UseBasicParsing -Uri "$base/handymen/1/income-summaries?month=2026-09" -Headers $headers).Content
```

HTTP **200**, on a fresh demo database:

```json
{"handyman_id":1,"month":"2026-09","total_income":5000,"total_expenses":0,"net_income":5000}
```

JWT requirements: HS256 signature, `sub` = provider ID string, `exp`, issuer
`moneymentor-local`, audience `moneymentor-api`. There is no public login endpoint;
token issuance is an administrator-only local lab CLI. This is not a live
HandyNear identity integration. In Swagger or other clients send the token in
`Authorization: Bearer TOKEN`, never in the URL.

## Six endpoint examples

Run in order in the second terminal, retaining `$base`, `$headers` and `$created`.
Examples are captured from a fresh demo; automatically generated IDs may differ
on later runs. Requests use the returned expense ID, never a hard-coded expense ID.

### 1. GET monthly income summary

The quickstart command above covers this endpoint. `month` is required in
YYYY-MM format. Totals include only the selected provider and month. A month
with no rows returns numeric zeros; net income can be negative.

### 2. POST an expense

<!-- example:create -->
```powershell
$body = @{ description='Replacement tools'; category='Equipment'; amount=2500; expense_date='2026-09-29' } | ConvertTo-Json
$created = Invoke-RestMethod -Method Post -Uri "$base/handymen/1/expenses" -Headers $headers -ContentType 'application/json' -Body $body
$created | ConvertTo-Json -Compress
```

HTTP **201**:

```json
{"id":1,"handyman_id":1,"description":"Replacement tools","category":"Equipment","amount":2500,"expense_date":"2026-09-29"}
```

All four request fields are required. Text must be nonblank; description maximum
200 characters, category maximum 40. Amount is a number from 0.01 to
9999999999.99 with up to two decimal places. Date is a real YYYY-MM-DD calendar
date, year 1000 or later. Unknown fields are rejected.

### 3. PATCH that expense

<!-- example:update -->
```powershell
$updated = Invoke-RestMethod -Method Patch -Uri "$base/expenses/$($created.id)" -Headers $headers -ContentType 'application/json' -Body '{"amount":3000}'
$updated | ConvertTo-Json -Compress
```

HTTP **200**:

```json
{"id":1,"handyman_id":1,"description":"Replacement tools","category":"Equipment","amount":3000,"expense_date":"2026-09-29"}
```

Only supplied fields change. At least one supported field is required. Sending
this same update twice leaves the same state. Re-fetch the income summary to
see total_expenses 3000 and net_income 2000 before deletion.

### 4. GET savings-goal progress

<!-- example:savings -->
```powershell
(Invoke-WebRequest -UseBasicParsing -Uri "$base/handymen/1/savings-goals" -Headers $headers).Content
```

HTTP **200**, raw JSON response:

```json
[{"id":1,"handyman_id":1,"goal_amount":1000,"current_amount":450,"progress_percentage":45}]
```

The raw HTTP response is an array. No goals returns `[]`. Progress is current_amount divided
by goal_amount times 100, rounded to two decimals; it can exceed 100%.

### 5. GET investment projections

<!-- example:investments -->
```powershell
(Invoke-WebRequest -UseBasicParsing -Uri "$base/handymen/1/investment-projections" -Headers $headers).Content
```

HTTP **200**, raw JSON response:

```json
[{"handyman_id":1,"initial_amount":1000,"monthly_contribution":100,"annual_rate":12,"years":1,"projected_value":2395.08}]
```

Rates are annual percentages. Calculations compound monthly with contributions
at month end, then round to two decimals. Zero rate and zero years are supported.
No investments returns `[]`. These are projections, not guaranteed returns.

### 6. DELETE the expense you created

<!-- example:delete -->
```powershell
$deleted = Invoke-WebRequest -UseBasicParsing -Method Delete -Uri "$base/expenses/$($created.id)" -Headers $headers
$deleted.StatusCode
```

HTTP **204**, **empty response body**. Do not try to parse a JSON body.
This only deletes the example expense whose ID is stored in `$created`.
The next income summary returns total_expenses 0 again.

## Error format and a reproducible error

Errors use `Content-Type: application/json` and an `error` string, not a success
object. Inspect the HTTP status first. Authentication is checked before route
validation, so an expired token may produce 401 before a malformed input's 400.

Repeat the deleted expense request:

<!-- example:notfound -->
```powershell
try {
  Invoke-WebRequest -UseBasicParsing -Method Delete -Uri "$base/expenses/$($created.id)" -Headers $headers
} catch {
  [int]$_.Exception.Response.StatusCode
  $_.ErrorDetails.Message
}
```

HTTP **404**:

```json
{"error":"Expense not found."}
```

| Status | Meaning | Example body |
|---|---|---|
| 400 | Bad month | `{"error":"month must use YYYY-MM format."}` |
| 400 | Invalid create body | `{"error":"Supply valid description, category, amount and expense_date."}` |
| 401 | Missing, invalid or expired token | `{"error":"A valid bearer token is required."}` |
| 404 | Missing or other provider | `{"error":"Handyman not found."}` |
| 404 | Missing or other-provider expense | `{"error":"Expense not found."}` |
| 413 | JSON payload exceeds 16 KB | `{"error":"Request is too large"}` |
| 500 | Database privileges incomplete | `{"error":"Database permissions are not configured for this operation."}` |
| 503 | JWT configuration missing | `{"error":"Authentication is not configured."}` |
| 503 | Database unavailable | `{"error":"Database unavailable. Check that MySQL is running and the database has been set up."}` |

## Troubleshooting

- **npm.ps1 blocked:** use `npm.cmd` and `npx.cmd` as shown; no PowerShell policy change needed.
- **ECONNREFUSED:** start MySQL and check DB_PORT in .env.admin before setup;
  after setup check .env.demo. Standard MySQL is usually 3306; this project's
  original private instance uses 3307.
- **Access denied at setup:** administrator credentials must allow CREATE DATABASE,
  CREATE USER and GRANT. Ask your machine's database administrator; do not put root
  credentials in the generated runtime file.
- **Demo already exists:** setup is deliberately non-destructive. If .env.demo
  exists, use start:demo. If the database exists but the file was lost, stop and ask
  the local administrator to recover/reset this specifically named demo. Do not
  delete the normal project database or rerun setup blindly.
- **Port 5001 in use:** stop the old demo API or change PORT in .env.demo, then
  change `$base` and the selected Swagger server URL to match.
- **401 after switching servers:** get a fresh token using the matching token CLI;
  demo and normal signing secrets are different.
- **404 with a valid token:** use provider 1 for the seeded demo; another provider's
  ID is intentionally indistinguishable from a missing record.
- **Examples show different IDs:** expected after rerunning tests/requests. Use
  `$created.id`; restarting the API does not reset database records.
- **No Swagger Try it out button:** offline reference is read-only by design;
  the PowerShell examples perform real requests without file-origin CORS issues.

## Regenerate docs and run tests

From `server`:

```powershell
npm.cmd run docs:build
npm.cmd test
npm.cmd run test:legacy
```

The normal tests use the local .env database, not .env.demo. For a clean-clone
demo test run, use `npm.cmd run test:demo` (same suite, isolated demo settings).
With the demo API running, `npm.cmd run docs:verify` checks the documented status
codes and response bodies and cleans up its own example expense.
Tests roll back changes, but auto-increment IDs may advance. Test fixtures should
only run on development databases. Swagger HTML embeds the spec, so rebuild it
whenever openapi.yaml changes; a teammate can still open the built file without npm.

## Scope and blind-test status

The documented provider contract has six operations. Local React-only extensions
are listed in server/README.md and use separate tables. No provider income,
savings or investment write API is promised; the quickstart seeds demonstration
inputs through its trusted setup script.

Author self-verification is recorded in docs/VERIFICATION.md. A real external
team's blind test has not yet been performed; see BLIND_TEST_REPORT.md. Self-tests
are not a substitute for the handout's external-team exercise. No site has been
published and no Week 8 changes have been pushed by this work.


## Week 9: HandyNear API key and demo records

HandyNear is our only external consumer. Run `node setup-api-key.js --demo` from
`server` once for the demo, or `node setup-api-key.js` for the normal `.env`.
Existing keys are preserved. Keys are saved only in that ignored configuration file. Share only
`HANDYNEAR_API_KEY` privately with HandyNear; use `MONEYMENTOR_TEST_API_KEY`
for your own tests. `API_KEYS` is the server allowlist containing both keys;
never send the entire allowlist as a request header or share it with a consumer.
Never commit it, put it in a URL, or embed it in React/browser code.
Restart the API after changing configuration (`npm.cmd run start:demo`).

All data endpoints require `X-API-Key`. Provider endpoints additionally require
`Authorization: Bearer <token>`; `node demo-token.js 1` generates provider 1's
one-hour token. The key itself remains valid until replaced in the configuration
and the server restarted. Replacing it revokes the old key.

PowerShell example (replace placeholders privately):

```powershell
$base = 'http://127.0.0.1:5001'
$headers = @{ 'X-API-Key' = '<private HandyNear key>'; Authorization = 'Bearer <provider 1 token>' }
Invoke-RestMethod -Uri "$base/api/handymen/1/savings-goals" -Headers $headers
Invoke-RestMethod -Uri "$base/api/handymen/1/investment-projections" -Headers $headers
Invoke-RestMethod -Uri "$base/api/handymen/1/income-summaries?month=2026-10" -Headers $headers
```

Missing/wrong API key: HTTP 401, `{"error":"Missing or invalid API key"}`.
More than 100 authenticated requests per key in a 60-second window: HTTP 429,
`{"error":"Rate limit exceeded. Try again later."}` with `Retry-After` in seconds.
`GET /api/health` is public because it exposes no business records or credentials.
The limiter is in memory: restarting resets it, and multiple instances would need
a shared store. Production configuration stays at 100; automated tests use 3.

Run `node seed-week9-demo.js` to top up the isolated demo data without replacing
existing records. There are at least 10 expenses, budgets, savings goals and
contact questions, and at least 10 provider-1 expenses, savings goals,
investments and income records. Income covers January–October 2026.
Income summaries return one calculated object per month. POST/PATCH/DELETE are
operations over these records, not lists of ten results. Questions remain
write-only: there is deliberately no public contact-details listing.
Partner reward records belong to our producer and are not fabricated locally.

The older React client does not yet send API keys; its data requests will receive
401 under this security policy. Use the command-line examples above for this lab.
Do not fix this by embedding the private key in frontend source. A production
browser client needs a backend session/proxy design.

Our producer's key, when supplied privately, goes in `PARTNER_API_KEY` on the
server; the partner client forwards it as `X-API-Key`. It is distinct from the
key HandyNear uses to call us.


## Local web access for Week 10

Run the production frontend build (`npm.cmd run build` at the repository root),
then run `npm.cmd run start:web` from server. Open http://localhost:3000 and click
Load rewards. This loopback-only web gateway keeps both keys on the server and
starts a separate protected API instance. It forwards only the rewards route.
Do not tunnel port 3000; remote user sessions are outside this local demo.
See WEEK10_RUN.md for current startup and failure/recovery instructions, which
supersede the earlier browser-blocked notes for the rewards panel only.
