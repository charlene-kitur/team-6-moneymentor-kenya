# Week 7 ? Parts A and B completed locally

Date: 2026-09-29
Scope: own-API setup, implementation fixes, contract clarifications and automated tests.
Stopped before Part C. No partner exchange, partner results, commit or push.

## Verified commands (run from server)

```powershell
npm.cmd test
npm.cmd run test:legacy
```

- Jest/Supertest: 10 suites passed, 97 tests passed, 0 failed.
- Existing Node suite: 3 tests passed, 0 failed (after local edit/delete URL migration).
- OpenAPI YAML parsed; all references resolve; all six contract operations retained.
- git diff --check passed. server/.env remains ignored.
- Test fixtures are rolled back. Provider tables were verified empty after the
  test run; existing local tracker data was not reassigned or deleted.

## Part A setup
- Installed Jest, Supertest and jsonwebtoken; lockfile updated.
- Jest discovers __tests__/**/*.test.js; npm test runs Jest serially.
- npm run test:legacy explicitly runs app.test.js with Node, avoiding runner collisions.
- Corrected local database configuration to the existing MySQL instance on 3307.
- Added provider tables with CREATE TABLE IF NOT EXISTS and configured local grants.
- Generated a private random JWT secret in ignored .env, never in source or output.

## Part B contract coverage

| Contract operation (base /api) | Happy path and meaningful assertions | Rejections / edge cases |
|---|---|---|
| GET /handymen/{id}/income-summaries | Exact owner/month/totals; filters other providers and months | Missing/invalid/repeated month, missing provider, empty month zeros |
| POST /handymen/{id}/expenses | 201, exact fields including handyman_id, persisted expense | Every required field, wrong types, invalid values, unknown fields, missing provider, minimum amount and maximum text |
| PATCH /expenses/{id} | 200, exact partial update, GET summary reflects saved change, repeatability | Empty body, invalid fields/ID, missing expense, other owner's expense, rejected changes preserve data |
| DELETE /expenses/{id} | Empty 204, subsequent GET summary excludes removed expense | Invalid ID, repeat delete 404, missing expense, other owner's expense |
| GET /handymen/{id}/savings-goals | Exact goal/current/progress values, owner isolation | Empty list, overfunding, invalid and missing provider |
| GET /handymen/{id}/investment-projections | Exact independently expected compounded value, owner isolation | Empty list, zero rate, zero years, invalid and missing provider |

Authentication tests cover all six operations: missing/malformed/expired tokens,
wrong signature/audience/issuer/algorithm, future token, invalid subject, and
missing expiration. Cross-provider paths return 404 rather than exposing records.

## Existing local application coverage
Local expense GET/POST and local PATCH/DELETE, budgets GET/POST, savings snapshot
GET/POST, question POST, health, welcome, unknown routes and malformed JSON remain
covered with real persistence, readback, validation and boundary assertions.
Collection and creation routes have no resource-ID lookup; not-found checks are
applied where applicable rather than invented for collection GETs.

## Fixes and design clarifications
- Implemented the missing provider routes using real MySQL provider data.
- Added JWT verification and ownership checks; expense category Equipment is accepted.
- PATCH schema now documents partial updates instead of requiring all fields.
- Provider data is isolated from the unauthenticated local tracker in separate tables.
- Local edit/delete URLs moved to /api/local/expenses/{id}; React editing URL updated.
- Added administrator-only local provisioning/token CLI; no public login invented.
- Documented income, savings and investment formulas and response errors in OpenAPI.
See CONTRACT_DEVIATIONS.md and server/README.md for the decisions and setup.

## Practical limits
This is local lab authentication, not live HandyNear identity-service integration.
Provider income, savings and investment records are populated through trusted
admin/import processes, because no write routes for those resources were requested
in the contract. Tests create explicit transactional fixtures; no fake demo data
is returned by the endpoints. The existing frontend dependencies are not installed
in this clone, so a frontend production build was not run for the one URL change.
The old npm start process, if any, must be restarted from this cloned server to
load the changes; tests instantiate the current app independently.

## Next boundary
Stop here before Part C as requested. No partner activity has been performed.
