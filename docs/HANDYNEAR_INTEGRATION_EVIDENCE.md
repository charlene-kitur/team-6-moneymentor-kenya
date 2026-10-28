# HandyNear integration evidence

Source: [HandyNear report](evidence/HandyNear_Week10_Integration_Evidence.docx), prepared by Kamau, Team 7. Activity date: 26 October 2026. Reviewed 27 October, including all five embedded screenshots. These are consumer-supplied observations, not fresh tests by MoneyMentor.

HandyNear consumed MoneyMentor's GET /api/handymen/1/savings-goals through its own backend. Its browser called /api/partner/savings-goals; the backend attached a bearer token from its private environment. It mapped goal_amount/current_amount/progress_percentage to goalAmount/currentAmount/progressPercentage.

| Evidence | Result |
|---|---|
| Tokenless direct request, 11:42 EAT | Report records 401 with A valid bearer token is required. |
| Figure 1, 12:16:54 EAT | HandyNear proxy returned 200, id 1, goalAmount 1000, currentAmount 450, progressPercentage 45. |
| Figure 2 | Dashboard displayed KES 450 of KES 1,000 (45%). |
| Figure 3, 11:58:32 EAT | Proxy returned 502 with Partner data unavailable. |
| Figure 4 | Dashboard displayed a clear unavailable message. |
| Figure 5 | Backend logged ECONNREFUSED; the figure alone does not establish that this was the same tunnel failure as Figure 3. |
| Recovery | Report says updating PARTNER_URL and restarting restored the data without a code change. |

This supports Week 10 downstream collaboration and successful consumption of one MoneyMentor endpoint. It does not prove MoneyMentor consumed Prestige, all six provider operations passed external tests, or an independent Week 8 blind swap occurred. Statements about ShieldBox concern HandyNear's downstream partner, not MoneyMentor's work.

The activity predates MoneyMentor's 27 October X-API-Key requirement. HandyNear must now send both X-API-Key and Authorization: Bearer, then retest. Its PARTNER_API_KEY variable held the JWT in the reported implementation; do not silently replace that token with the new API key. Configure separate values for the two headers. The old token and tunnel cannot establish current availability.
