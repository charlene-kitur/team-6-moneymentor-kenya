# Week 6 — Write Endpoints and Validation

## Project
MoneyMentor Kenya

## Test environment
- Backend: Node.js and Express
- Database: MySQL
- Base URL: http://localhost:5000
- Resource: expenses

## Implemented write endpoints

| Method | Path | Purpose | Success status |
|---|---|---|---|
| POST | /api/expenses | Create an expense | 201 Created |
| PATCH | /api/expenses/{expenseId} | Update supplied expense fields | 200 OK |
| DELETE | /api/expenses/{expenseId} | Delete an expense | 204 No Content |

## Validation rules

POST requires:
- description: non-empty string, maximum 200 characters.
- category: Housing, Food, Transport, Utilities, Education,
  Health, or Other.
- amount: positive number, maximum 9999999999.99,
  with up to two decimal places.
- expense_date: valid calendar date in YYYY-MM-DD format,
  no earlier than 1000-01-01.

PATCH:
- Requires at least one supported expense field.
- Validates every supplied field using the expense rules.
- Rejects unsupported fields.
- Preserves fields omitted from the request.

PATCH and DELETE require a positive integer expense ID.

Invalid input returns 400 before any data is changed.
Updating or deleting a missing expense returns 404.

## Verification results

| Test | Expected result | Observed result |
|---|---|---|
| Valid POST | 201 and saved expense | Passed in automated testing; manual request also returned a saved expense |
| POST with empty body | 400 and no new record | 400; expense list showed no new record |
| PATCH amount only | 200; other fields preserved | Expense 10 changed from amount 10 to 25; other fields stayed unchanged |
| PATCH negative amount | 400; record unchanged | Validation error; subsequent GET showed amount still 25 |
| PATCH wrong-type amount | 400; record unchanged | Passed in automated testing |
| PATCH empty body or unsupported field | 400; record unchanged | Passed in automated testing |
| DELETE existing expense | 204; record removed | 204; removal also verified in automated database checks |
| PATCH deleted expense | 404 | 404 with "Expense not found." |
| DELETE deleted expense again | 404 | 404 with "Expense not found." |
| DELETE invalid ID | 400 | Passed in automated testing |

## Automated verification

Command run from the server folder:

    npm.cmd test

Result: 3 tests passed, 0 failed.

The integration test includes multiple POST, PATCH, and DELETE
checks against MySQL. Test changes are rolled back.

## Issues resolved

The application database account initially lacked DELETE and
UPDATE permissions on expenses. These permissions were granted,
and the affected operations were tested successfully.

## Outstanding contract verification

Compare all implemented write routes, request schemas, and
response schemas with openapi.yaml before final submission.
Record any changes in CONTRACT_DEVIATIONS.md.
