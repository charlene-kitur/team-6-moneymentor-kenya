# Consumer endpoint list

Base URL ends in /api. All operations require X-API-Key plus a role-appropriate bearer token.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | /handymen/{handymanId}/income-summaries?month=YYYY-MM | Provider income, expenses and net income |
| POST | /handymen/{handymanId}/expenses | Create owned provider expense |
| PATCH | /expenses/{expenseId} | Update owned provider expense |
| DELETE | /expenses/{expenseId} | Delete owned provider expense |
| GET | /customers/{customerId}/wallet | Own simulated KES balance |
| POST | /customers/{customerId}/wallet/topups | Add simulated cents with idempotency key |
| POST | /bookings/{bookingId}/pay | Pay trusted registered booking with idempotency key |
| GET | /customers/{customerId}/wallet/transactions | Own transaction history |

Provider savings-goals and investment-projections endpoints retired at contract 2.0.0. See WALLET_INTEGRATION.md and openapi.yaml for customer tokens and payloads.

Server-to-server booking registration: `PUT /api/bookings/{bookingId}`. API key only; body `{customer_id, handyman_id, amount_cents}`. Creates once (201), rejects existing ID (409).
