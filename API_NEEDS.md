# Week 2: API Needs Statements

## Needs Statements
1. HandyNear does not need to read or write financial data from MoneyMentor Kenya, because their app does not track handyman earnings or customer budgets.
2. HandyNear does not need access to expense or savings information, because these resources do not map to HandyNear’s core entities (Users, Handymen, Services, Bookings, Reviews, Categories).
3. HandyNear does not require real-time or periodic financial updates, because financial tracking is not part of their provider or customer workflows.

## Reflection
We were surprised that our downstream partner had no API needs from us at all. We expected at least some overlap, such as handyman income tracking or customer budgeting, but HandyNear clarified that these features are out of scope for their current project. This highlighted the importance of asking direct questions — instead of assuming integration, we learned that our API will not be consumed by HandyNear in Week 2–3. The exercise showed us that documenting “no needs” is just as valuable as documenting specific ones, because it prevents wasted effort building endpoints nobody will use.

## Audit Check (Week 1 vs. HandyNear)
- None of MoneyMentor Kenya’s Week 1 resources (income, expenses, savings, investments, contact form) map to HandyNear’s core entities (Users, Handymen, Services, Bookings, Reviews, Categories).
- This means HandyNear has no API needs from MoneyMentor Kenya in Week 2–3.
- Gap flagged: our app’s financial resources are not consumed by HandyNear. We will raise this with the instructor as advised in Part E.