 Week 3: ENDPOINT LIST

| Method | Path | Purpose | Maps to Need |
|---|---|---|---|
| GET | `/handymen/{handymanId}/income-summaries?month={yyyy-mm}` | Return a handyman's income summary for the requested month so HandyNear can display earnings insights. | Monthly income summary |
| POST | `/handymen/{handymanId}/expenses` | Create a new expense record when a handyman logs a business cost. | Create expense records |
| PATCH | `/expenses/{expenseId}` | Update an existing expense record's amount, category, date or description. | Update expense records |
| GET | `/handymen/{handymanId}/savings-goals` | Return the handyman's savings goals and current progress. | Savings-goal progress |
| GET | `/handymen/{handymanId}/investment-projections` | Return investment-growth projections for long-term financial planning. | Investment-growth projections |

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

- We did not add `DELETE /expenses/{expenseId}` because HandyNear did not confirm a need to delete expense records.
- We did not add `GET /expenses/{expenseId}` because HandyNear's confirmed need only requires creating and updating expenses.
- Adding either endpoint would violate the requirement that every endpoint trace back to a confirmed line in `API_NEEDS.md`.
- No pluralization or nesting changes were required.
- We clarified the investment-projections purpose to explain how HandyNear will use the returned information.