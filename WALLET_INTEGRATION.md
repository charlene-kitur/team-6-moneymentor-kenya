# HandyNear simulated wallet integration

Contract version 2.1.0 uses the existing /api prefix. All amounts in the wallet API are whole KES cents (100 cents = KSh 1). Every wallet response includes simulated: true. Demo credit is freely issued by the top-up route to the authenticated customer.

## Consumer endpoints

| Method | Path after /api | Authentication |
| --- | --- | --- |
| GET | /handymen/{handymanId}/income-summaries?month=YYYY-MM | API key + handyman bearer |
| POST | /handymen/{handymanId}/expenses | API key + handyman bearer |
| PATCH | /expenses/{expenseId} | API key + handyman bearer |
| DELETE | /expenses/{expenseId} | API key + handyman bearer |
| PUT | /bookings/{bookingId} | Server-to-server API key only |
| GET | /customers/{customerId}/wallet | API key + customer bearer |
| POST | /customers/{customerId}/wallet/topups | API key + customer bearer + Idempotency-Key |
| POST | /bookings/{bookingId}/pay | API key + customer bearer + Idempotency-Key |
| GET | /customers/{customerId}/wallet/transactions | API key + customer bearer |

The former provider savings-goals and investment-projections GET routes return 404 after restarting the updated API. Historical database records are retained. MoneyMentor's local savings planner and its local /api/savings-goals route remain part of the website.

## Authentication and ownership

The API key identifies HandyNear. A customer JWT has sub equal to the customer ID and role equal to customer. It expires after one hour. Provider tokens cannot access wallets. Customer tokens cannot access provider income or expenses. Access to another customer's wallet or booking returns 404. Keep tokens and keys on HandyNear's backend.

## Trusted booking registration

Payment reads the stored booking price and owner. HandyNear registers its bookings with PUT /api/bookings/{bookingId}, using its API key on its backend. No bearer token is required for registration. Send exactly {customer_id, handyman_id, amount_cents} with positive integer values. The amount limit is 1000000000 cents. The route returns 201 for a new pending booking, 409 for an existing ID (even if the same payload is repeated), 400 for invalid input, and 404 for an unknown wallet or handyman. The existing local administrator command remains available. Existing booking IDs cannot be overwritten. The customer cannot submit a payment price.

Run from server after wallet-schema.sql has been applied:

```powershell
node wallet-admin.js customer 1 "Demo customer"
node wallet-admin.js booking 1 1 1 50000
$customerToken = node wallet-admin.js token 1
```

These commands create customer 1 with zero credit and booking 1 for customer 1, handyman 1, at KSh 500. Use available IDs on an existing database. Names and booking amounts are demo choices. Issuing a token for a real customer requires verifying their identity outside this demo CLI.

## PowerShell example

```powershell
$base = 'http://127.0.0.1:5001'
$apiKey = Read-Host "Paste your privately issued MoneyMentor API key"
$customerToken = node wallet-admin.js token 1
$headers = @{ 'X-API-Key'=$apiKey; Authorization="Bearer $customerToken" }

Invoke-RestMethod "$base/api/customers/1/wallet" -Headers $headers

$topupHeaders = $headers.Clone()
$topupHeaders['Idempotency-Key'] = 'demo-topup-001'
Invoke-RestMethod -Method Post -Uri "$base/api/customers/1/wallet/topups" -Headers $topupHeaders -ContentType 'application/json' -Body '{"amount_cents":100000}'

$payHeaders = $headers.Clone()
$payHeaders['Idempotency-Key'] = 'demo-payment-001'
Invoke-RestMethod -Method Post -Uri "$base/api/bookings/1/pay" -Headers $payHeaders -ContentType 'application/json' -Body '{}'

Invoke-RestMethod "$base/api/customers/1/wallet/transactions" -Headers $headers
```

## Transaction rules

A successful top-up or payment returns 201 with id, customer_id, type, amount_cents, balance_after_cents, booking_id, currency and simulated. History also includes created_at. A GET wallet response has customer_id, balance_cents, currency and simulated.

Repeat the original key with the original operation to receive the original 201 response without changing the balance again. Its balance_after_cents is the balance at that transaction, so use GET wallet for the current balance. Reuse a key for different content or a different operation and receive 409. Keys are case-sensitive and scoped to the customer.

A new key for an already-paid booking returns 409. Insufficient funds, cancelled bookings and the KSh 10 million balance limit also return 409. Failed transactions roll back and do not consume the idempotency key. The maximum top-up is 1000000000 cents. Invalid amounts, extra top-up fields, payment body fields and missing idempotency keys return 400.

Wallet locking prevents concurrent double spending. Payment, ledger entry, booking state and handyman income are committed in one database transaction. The existing income summary includes the simulated booking earnings in KES units on the payment date. Refunds and public booking creation need a later agreed contract.

## Schema installation

New installations run wallet-schema.sql through setup-db.js or setup-demo.js. Existing installations must run wallet-schema.sql with a database administrator against the intended database. Grant the application's database user SELECT, INSERT, UPDATE and DELETE on the four wallet tables. The migration adds tables without dropping historical savings or investment data.

## Handoff checklist

Send HandyNear the updated openapi.yaml and this guide. Use the shared IDs and registration route below, integer cents and customer-role tokens. Restart the API process to serve these routes through the existing tunnel. The previous provider savings route will then return 404. Replace old saved consumer handoff instructions before sharing credentials again.

## Verified on 4 November 2026

123 backend tests passed across 15 suites, including 16 wallet tests using MySQL. Coverage includes concurrent duplicate topups/payments, competing bookings with insufficient total balance, role/ownership checks, price tampering, key conflicts and an injected ledger failure proving rollback of wallet balance, booking status and income. Demo customer 1 and pending booking 1 (KSh 500) have been provisioned in the existing demo database. The running API requires a restart to load this migration.

## Team 7 rehearsal handoff — 7 November 2026

Demo database IDs verified: 1 John Mwangi, 2 Grace Wanjiru, 3 Peter Otieno. Customers 1 and 2 are provisioned with wallets; existing balances are preserved. Booking IDs are HandyNear IDs, used unchanged. Booking 1 already exists from the earlier demo and will return 409; inspect/coordinate this existing booking before reusing that ID. Never overwrite it automatically.

Register a booking from HandyNear backend with X-API-Key and JSON Content-Type. Example body: {"customer_id":1,"handyman_id":1,"amount_cents":50000}. Keep the API key off the browser. Payment still requires the customer bearer token and Idempotency-Key.

Generate fresh one-hour tokens before each rehearsal/presentation from server:

```powershell
node wallet-admin.js token 1
node wallet-admin.js token 2
Get-Date -Format "yyyy-MM-dd HH:mm:ss zzz"
```

The current tokens and API key are in server/.env.wallet-handoff.txt, ignored by Git; share privately. No public token endpoint has been added. Restart the API to load the registration route.

Verification after registration changes: 125 tests passed across 15 suites, including missing/wrong API keys, registration without bearer, duplicate and concurrent registration, field validation, unknown foreign IDs, and payment of an API-registered booking.
