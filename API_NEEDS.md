 Week 2: API NEEDS STATEMENTS

TEAM MEMBERS
Daniella Muita-218835
Ryan Njuguna-220788
Jasmine Kilemi-219804
Charlene Kitur-220983

 NEEDS STATEMENTS

1. Monthly Income Summary

HandyNear needs to read a handyman's monthly income summary from MoneyMentor Kenya in order to display earnings insights on provider dashboards.

- Freshness: Updated daily is sufficient
- Volume: Once per dashboard load
- Authentication: Yes, provider authentication is required

2. Expense Records

HandyNear needs to create and update expense records in MoneyMentor Kenya in order to let handymen track their costs alongside booking revenue.

- Freshness:Real-time updates are preferred
- Volume:Occasional, whenever a handyman logs or updates an expense
- Authentication:Yes, provider authentication is required

3. Savings Goal Progress

HandyNear needs to read a handyman's savings-goal progress from MoneyMentor Kenya in order to show financial milestones inside the provider dashboard.

- Freshness: Updates within one hour are acceptable
- Volume:Once per dashboard load
- Authentication: Yes, provider authentication is required

 4. Investment Growth Projections

HandyNear needs to read investment-growth projections from MoneyMentor Kenya in order to provide handymen with long-term financial-planning tools.

- Freshness: Weekly updates are sufficient
- Volume: Occasional, when a handyman checks projections
- Authentication: Yes, provider authentication is required

REFLECTION

Our discussion with HandyNear identified meaningful integration points between the two applications. HandyNear can use financial information from MoneyMentor Kenya to complement its booking and service-provider workflows.

Monthly income summaries can provide earnings insights, while expense records can help handymen compare their costs with booking revenue. Savings-goal progress and investment projections can give providers access to broader financial-planning information through their HandyNear dashboards.

This exercise showed the importance of discussing possible workflows directly with the downstream partner. Our original audit found no integration needs, but further discussion revealed several useful and realistic API requirements.

AUDIT CHECK: WEEK 1 VS. HANDYNEAR

The following MoneyMentor Kenya resources now map to HandyNear workflows:

- Income summaries map to handyman earnings insights.
- Expense records map to provider business-cost tracking.
- Savings goals map to financial milestones.
- Investment projections map to long-term financial planning.

