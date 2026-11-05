# HandyNear simulated wallet integration

Contract version 2.0.0 uses the existing /api prefix. All amounts in the wallet API are whole KES cents (100 cents = KSh 1). Every wallet response includes simulated: true. Demo credit is freely issued by the top-up route to the authenticated customer.

## Consumer endpoints

| Method | Path after /api | Authentication |
| --- | --- | --- |
| GET | /handymen/{handymanId}/income-summaries?month=YYYY-MM | API key + handyman bearer |
| POST | /handymen/{handymanId}/expenses | API key + handyman bearer |
| PATCH | /expenses/{expenseId} | API key + handyman bearer |
| DELETE | /expenses/{expenseId} | API key + handyman bearer |
| GET | /customers/{customerId}/wallet | API key + customer bearer |
| POST | /customers/{customerId}/wallet/topups | API key + customer bearer + Idempotency-Key |
| POST | /bookings/{bookingId}/pay | API key + customer bearer + Idempotency-Key |
| GET | /customers/{customerId}/wallet/transactions | API key + customer bearer |

The former provider savings-goals and investment-projections GET routes return 404 after restarting the updated API. Historical database records are retained. MoneyMentor's local savings planner and its local /api/savings-goals route remain part of the website.

## Authentication and ownership

The API key identifies HandyNear. A customer JWT has sub equal to the customer ID and role equal to customer. It expires after one hour. Provider tokens cannot access wallets. Customer tokens cannot access provider income or expenses. Access to another customer's wallet or booking returns 404. Keep tokens and keys on HandyNear's backend.

## Trusted booking registration

Payment reads the stored booking price and owner. HandyNear and MoneyMentor must agree on the verified booking import process before live integration. The current demo uses a local administrator command. Existing booking IDs cannot be overwritten. The customer cannot submit a payment price.

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

Send HandyNear the updated openapi.yaml and this guide. Agree on shared customer and booking IDs, trusted booking registration, cents and the new customer token role. Restart the API process to serve these routes through the existing tunnel. The previous provider savings route will then return 404. Replace old saved consumer handoff instructions before sharing credentials again.

## Verified on 4 November 2026

123 backend tests passed across 15 suites, including 16 wallet tests using MySQL. Coverage includes concurrent duplicate topups/payments, competing bookings with insufficient total balance, role/ownership checks, price tampering, key conflicts and an injected ledger failure proving rollback of wallet balance, booking status and income. Demo customer 1 and pending booking 1 (KSh 500) have been provisioned in the existing demo database. The running API requires a restart to load this migration.
