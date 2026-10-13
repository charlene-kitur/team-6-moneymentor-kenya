# Contract changes and resolutions ? Week 7 Parts A and B

The six existing provider contract operations are implemented and tested.
The /api prefix remains in servers.url; it is not duplicated in OpenAPI paths.

## Resolved implementation gaps
- Added provider-scoped POST expenses and GET income/savings/investment routes.
- Provider expense responses contain handyman_id.
- Provider expense category accepts nonblank text up to 40 characters, including
  the contract example Equipment. The legacy local tracker retains its enum.
- Added verified JWT authentication and provider ownership checks.
- DELETE is implemented with an empty 204 response and missing-row 404.

## Explicit contract clarifications
- PATCH now references ExpensePatch: at least one supported field, all optional
  individually, no unknown properties. Omitted values remain unchanged.
- Expense amount maximum and two-decimal precision match the SQL storage.
  Description/category must be nonblank; date must be real and year >=1000.
- Added 400, 404 and 503 outcomes where applicable (invalid ID, missing provider,
  unavailable database or authentication configuration).
- JWT uses HS256, subject = provider ID, expiration, issuer and audience checks.
  Another provider's resource returns 404 to avoid exposing its existence.
- Documented income monthly aggregation, savings overfunding, and investment
  monthly compounding with end-of-month contributions and zero-rate behavior.

These are local project decisions, not claimed instructor approval. Review the
updated contract before any later partner exchange.

## Local tracker compatibility
The pre-existing local application remains an extension outside the provider
contract. Its PATCH/DELETE routes moved to /api/local/expenses/{expenseId}; the
React editing URL and legacy tests were updated. Provider routes use separate
provider tables so unauthenticated local routes cannot access provider records.
Existing local data was not reassigned or deleted.

No public login endpoint was invented. A local administrator CLI can provision
providers and issue expiring development tokens. Live HandyNear integration is
outside these lab Parts A and B.
