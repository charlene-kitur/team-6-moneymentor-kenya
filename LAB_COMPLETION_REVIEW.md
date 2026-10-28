# Lab completion review

Reviewed 27 October 2026. Sources: Week 1, 2 and 4–10 lab PDFs in Downloads; Week 3 online lecture slides (no Week 3 lab handout found); project documents/code; prior recorded test runs; HandyNear's 26 October evidence and five screenshots. A file's existence is not proof of an external activity. No GitHub collaboration settings or latest remote state were checked. No new tests were run during this document audit. No commits or pushes were made.

## Completion by week

| Week | Evidence present | What remains missing or unverified |
|---|---|---|
| 1 — Team/repository | TEAM_CHARTER.md has four members/roles, application audit and Team 5/7 ring positions. Repository and earlier successful pushes exist. | All collaborators accepting invitations and a non-owner access check are not verified here. Charter describes the original frontend-only app; label that historical context if presenting it as current. |
| 2 — Needs | API_NEEDS.md has four specific HandyNear needs, freshness/volume/auth details and a reflection. | Upstream interview notes are not evident. The audit mapping claims income/expense resources but the Week 1 app had no persistent income/expense storage; explicitly flag the expansion and any required instructor discussion. Actual interviews cannot be independently verified from the text alone. |
| 3 — Endpoint design | Six operations, GET plus write verbs, purposes, need mappings, review feedback and revisions exist in ENDPOINT_LIST.md. | Reviewer identity and confirmation they were outside the ring are not recorded. Full lab-specific audit is limited because only lecture slides were found. DELETE maps to a need absent from API_NEEDS.md; reconcile that decision. |
| 4 — Contract | openapi.yaml covers the six provider operations, schemas and examples; current API-key and bearer schemes exist. HandyNear's evidence confirms it used our contract. | CONTRACT_QUESTIONS.md is missing: write three genuine questions about Prestige's contract. Swagger Editor zero-error validation evidence is not recorded here; YAML parsing is not full OpenAPI validation. Confirm upstream contract receipt/version. |
| 5 — GET endpoints | Three provider GETs are implemented and own tests check real DB values/ownership; CONTRACT_DEVIATIONS.md exists. HandyNear confirms savings data externally. | Required Swagger UI Try it out field-by-field verification is not established. Existing offline docs disable submission methods. Do not count source/test review as that specific UI activity. |
| 6 — Writes | POST/PATCH/DELETE implementation, validation, persistence and missing-ID checks are covered in own test evidence and TEST_RESULTS.md. | Main implementation work is evidenced. Week 9 security changes should also be logged in CONTRACT_DEVIATIONS.md and communicated to the consumer; keep old test results dated. |
| 7 — Automated tests/exchange | Prior run: 102 Jest tests across 12 suites plus 3 legacy tests passed after API-key changes. week_7_test_results.md records the original 97-test run. | Parts C–E partner exchange remain incomplete: exchange contracts, independently write/run tests both ways, classify findings and produce PARTNER_TEST_RESULTS.md (missing). HandyNear's integration screenshots are not a contract-derived automated test exchange. |
| 8 — Docs/blind test | README, rendered docs, BLIND_TEST.md and BLIND_TEST_REPORT.md exist; Prestige setup blocker is recorded. | Independent README-only swap and observation of another team using our README remain unverified. Record real timing/outcome and feedback-driven fixes. Prestige attempt had prior context and setup blocked. Refresh rendered docs after security changes; embedded spec is older than current API-key contract. Test README from a clean setup and remove contradictory historical instructions. |
| 9 — API keys/security | API-key middleware, per-key 100/min limit, 401/200/429 tests and SECURITY_AUDIT.md exist. Private demo key is ignored. | Confirm HandyNear privately received its new key and current server was restarted; retest both headers. Own-team automated tests use ephemeral keys, but a separate running-server own-team key is not configured by the setup script (do not share HandyNear's key for all callers). Complete the history-secret check and write the reason for choosing 100/min. Save a clear terminal/screenshot 200/200/200/429/429 demonstration; assertion code alone is not the requested output artifact. |
| 10 — Integration | MoneyMentor backend adapter, React panel, stand-in failure/recovery tests and integration log exist. HandyNear document confirms downstream display, fallback and recovery on 26 October. | Obtain working Prestige URL/key and matching contract; make a successful authenticated terminal call and compare fields. Complete MoneyMentor browser live data/down/recovery demonstration. Current panel fetch has no API key and main backend requires one, so current normal-server flow is blocked. Keep partner key server-side; resolve browser access deliberately. Confirm partner contact and TA check-in. Retest HandyNear after new auth. |

## Most important remaining actions

1. Complete the Week 4 producer contract questions file using Prestige's actual contract.
2. Arrange the Week 7 two-way test exchange and record real results in PARTNER_TEST_RESULTS.md.
3. Arrange the Week 8 independent README test (or documented permitted substitution), including another team's attempt with our README. Keep the existing setup failure as evidence rather than replacing it with invented success.
4. Finish MoneyMentor's live Prestige integration and three-stage browser demo; HandyNear's successful consumption of us does not complete this direction.
5. Resolve the browser request versus API-key middleware conflict without putting a private key into React source. This audit does not alter application behavior.
6. Send HandyNear its new key privately, explain that it must keep the JWT as well, and obtain a fresh successful response. Their PARTNER_API_KEY variable previously held a JWT, so two distinct values/header mappings are needed.
7. Refresh/validate rendered docs and current quickstart, capture rate-limit output, finish security audit gaps, then review the uncommitted files for submission when authorized.

## Submission status

Current git status contains modified and untracked Week 8–10 files, including the security middleware, integration code and reports. These latest changes are not committed or pushed. Earlier commits were pushed during the conversation, but that does not publish current changes. This is intentional under the no-push instruction; it is still outstanding against handout submission checklists. Do not assume missing instructor-template/PR setup is a failure: Week 1 previews it, while later handouts condition branch naming on actually receiving the template. Confirm course-specific instructions separately.

## Scope of HandyNear evidence

The evidence belongs to Week 10 Part E (supporting our downstream consumer) and cross-team collaboration. It demonstrates one endpoint on 26 October, before X-API-Key was introduced. Its own Week 7/8 open items and ShieldBox integration details belong to HandyNear, not MoneyMentor. They must not be copied as our accomplishments or our failures.

The original evidence and a precise summary are under docs/evidence and docs/HANDYNEAR_INTEGRATION_EVIDENCE.md. INTEGRATION_LOG.md includes the downstream findings. BLIND_TEST_REPORT.md explains why this does not close the independent blind-test requirement.

## Week 4 follow-up — 27 October 2026

CONTRACT_QUESTIONS.md is now present with three concrete Prestige contract
questions. The current OpenAPI contract passed structural validation and reference
resolution; all six provider operations remain present. Missing 401/429 and health
response schemas were added, and rendered docs rebuilt. See docs/WEEK4_VALIDATION.md.
The earlier missing-file observation is resolved. Swagger Editor browser validation,
sharing the updated contract/questions, receiving answers, and submission are not
claimed complete. No changes were pushed.


## Current plan — Week 7 deferred; Week 9 verified locally

Week 7 partner exchange is deferred at the user's request, not completed. Its
missing exchange evidence and PARTNER_TEST_RESULTS.md remain outstanding.
Week 9 now has separate consumer/own-team keys, actual HTTP rate-limit output,
a limited history-secret scan, threshold justification and fresh passing test
runs. See SECURITY_AUDIT.md and docs/WEEK9_HTTP_RESULTS.txt. Remaining steps are
consumer-server restart, private key handoff and consumer retest, plus submission
when authorized. Group 5's URL was not required for these checks.


## Week 10 update — 28 October 2026

The Prestige live terminal call and rewards browser integration now succeed.
The browser displayed real reward data, handled a deliberately unavailable
PARTNER_URL with a friendly message, and recovered after restoring the URL.
Build succeeded and 104 Jest tests passed. Screenshots/log are saved. This closes
the earlier rewards-panel browser blocker for the loopback team demo; remote
multi-user access and unrelated expense tracker behavior are not claimed fixed.
Week 7 remains deferred. Independent blind swap, check-in/contact arrangements,
HandyNear's new-auth retest and authorized submission remain separate items.
