 Week 3: ENDPOINT LIST

| Method | Path | Purpose | Maps to Need |
|---|---|---|---|
| GET | `/handymen/{handymanId}/income-summaries?month={yyyy-mm}` | Return a handyman's income summary for the requested month so HandyNear can display earnings insights. | Monthly income summary |
| POST | `/handymen/{handymanId}/expenses` | Create a new expense record when a handyman logs a business cost. | Create expense records |
| PATCH | `/expenses/{expenseId}` | Update an existing expense record's amount, category, date or description. | Update expense records |
| GET | `/handymen/{handymanId}/savings-goals` | Return the handyman's savings goals and current progress. | Savings-goal progress |
| GET | `/handymen/{handymanId}/investment-projections` | Return investment-growth projections for long-term financial planning. | Investment-growth projections |
| DELETE | `/expenses/{expenseId}` | Delete an existing expense record. | Delete expense records |

AUTHENTICATION

All endpoints require provider authentication.

HandyNear should send an access token using:

`Authorization: Bearer <access-token>`

The API must confirm that the provider has permission to access the requested handyman's information.

 PEER REVIEW FEEDBACK

- Reviewer suggested adding a `DELETE` endpoint for expenses.
- Reviewer recommended adding a single-item `GET` endpoint for expenses.
- Reviewer confirmed that pluralization and nesting are consistent across all paths.
- Reviewer requested greater clarity in the Purpose column for investment projections.

REVISIONS AFTER PEER REVIEW

- DELETE was initially deferred; it was added to the endpoint list and OpenAPI contract in Week 6 and is now implemented with provider ownership checks.
- We did not add `GET /expenses/{expenseId}` because HandyNear's confirmed need only requires creating and updating expenses.
- The single-item GET remains deferred; the current contract contains six operations.
- No pluralization or nesting changes were required.
- We clarified the investment-projections purpose to explain how HandyNear will use the returned information.
