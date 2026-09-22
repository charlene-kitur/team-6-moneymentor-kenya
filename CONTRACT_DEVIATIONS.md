# Contract Deviations — Week 6

## Review status

The differences below were identified by comparing the
implementation with ENDPOINT_LIST.md.

Comparison with the original openapi.yaml is still pending.
These entries do not establish that the revised design has
been approved.

## 1. Expense creation route and ownership

Original listed route:
POST /handymen/{handymanId}/expenses

Implemented route:
POST /api/expenses

The current implementation is a local, single-user expense
tracker. It does not associate expenses with a handymanId.

This changes both the route and the ownership model; it is
not only a URL-prefix change.

Required resolution:
Implement the original contract, or confirm the revised scope
and update openapi.yaml accordingly.

## 2. Expense update and delete paths

Original listed routes:
PATCH /expenses/{expenseId}
DELETE /expenses/{expenseId}

Implemented routes:
PATCH /api/expenses/{expenseId}
DELETE /api/expenses/{expenseId}

The implementation uses the /api prefix consistently with
the existing backend routes.

Required resolution:
Confirm whether /api belongs in the OpenAPI server URL or
in its path definitions, then align the documentation.

## 3. Expense request fields and validation

The implementation uses:
description, category, amount, expense_date.

Required resolution:
Compare these exact names, types, required fields, enum values,
limits, and date format with openapi.yaml.

## 4. Status codes and response bodies

Implemented outcomes:
- POST success: 201 with the created expense.
- PATCH success: 200 with the updated expense.
- DELETE success: 204 with no body.
- Invalid input: 400 with an error message.
- Missing expense on PATCH or DELETE: 404.

Required resolution:
Verify that the OpenAPI response schemas match these responses,
including the use of the "error" field in error bodies.