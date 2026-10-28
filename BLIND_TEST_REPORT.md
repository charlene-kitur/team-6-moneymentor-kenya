# Week 8 blind-test report

## Status: external blind test not yet performed

## Latest attempt: Prestige — 27 October 2026

Repository revision: e33f537f64bde99678c8662a1a4299e39f6f6143 (main).
We attempted the supplied README's setup instructions in an isolated clone on
our laptop. README.md and .env.example are absent. Both `npm run db:setup` and
`npm test` fail with Missing script errors. Only start and dev scripts exist.
No HTTP response was obtained; precise elapsed time was not captured.

The producer must supply the matching revision or missing configuration and
setup/test scripts. No producer code was changed. No independent team's new
attempt with our MoneyMentor README was observed, so their success, timing and
feedback remain unverified. No feedback-driven documentation fixes are claimed.

It did not produce a working request: the documented setup was blocked. This
does not prove the deployed API is broken. No keys were bypassed and no tests
are claimed as passed. Prestige is our producer with prior context; the Week 8
outside-ring swap or permitted substitution remains unconfirmed. Add actual
HTTP results here when a working producer URL and required access are available.
Nothing was committed or pushed. See the Prestige section in BLIND_TEST.md.
Earlier sections below are historical observations, not this test's results.

The documentation and author self-checks were previously prepared locally. A preliminary HandyNear README and source review has since been completed, but no live blind-test response or confirmed external test of our README has been recorded. Author self-checks and source reviews are not blind tests. This update does not commit, push or host anything.

## 1. What happened when the other team tested our README?

Not yet performed. There is no observed success/failure, elapsed time or point
of confusion to report. Do not mark this section successful based on our tests.

Record after the real exercise:
- Team and whether it is outside our ring:
- Date and start/end time:
- Any scheduling substitution and why:
- README revision supplied:
- API access method (local setup or shared URL; no credentials in this report):
- First successful request and HTTP status, or exact blocking step:
- Time to first success:
- Verbal assistance: none required by the exercise; record any deviation:

## 2. Documentation fixes

Author self-review fixes already made (not external-team findings):
- Added a complete root README with database startup prerequisites and commands.
- Added non-destructive isolated demo setup, provider 1 and sample financial rows.
- Documented administrator setup versus generated runtime credentials.
- Documented one-hour JWT issuance and the demo/normal API port distinction.
- Added real requests and response examples for all six contract operations.
- Replaced unavailable curl.exe with native PowerShell for the quickstart.
- Used raw response Content for collection GETs to avoid PowerShell array wrappers.
- Embedded Swagger assets and spec so docs/index.html works without npm or internet.

External-team findings and fixes: pending. Record them only after observing them.

## 3. Honest outcome

We have not yet established whether a person outside our team can use this README
without help. Author execution of the documented commands succeeded against an
isolated local demo, and all six rendered operations were inspected, but these
checks do not satisfy the blind swap and independent test requirements. Parts C
and D remain pending, and this report must be updated after the real exercise.

## Next steps for the actual lab exercise

1. Find a team outside the ring, or record the permitted scheduling substitution.
2. Share only README.md and API access/local setup instructions, without coaching.
3. Receive only their README and access instructions.
4. Attempt a real request from their README without messaging or reading their code.
5. Record success, elapsed time, or exact failure; observe their attempt without helping.
6. Fix documentation based on real findings and complete this report.

## Separate author verification

See docs/VERIFICATION.md for the self-check evidence. Never relabel it as an
external-team result. Publishing and pushing are deliberately not performed.

## 4. HandyNear review update — 21 October 2026

Repository: https://github.com/Akipxxy/HandyNear_IAP
Reviewed revision: bad7951928914d40a096445f664a30b916605a35
Findings refer to the 14 October review, not a new check of the current branch.

### What happened
We reviewed the README and subsequently inspected source code. No live API
request was completed, no HTTP response was captured, and time was not measured.
This does not qualify as the README-only blind test required by Part D.

### Documentation and setup gaps
- Repository URL placeholder required separate information.
- Schema import path does not match server/schema.sql.
- Inspected schema lacks CREATE TABLE statements.
- Sample-data columns differ from backend columns.
- Responses are illustrative and example resource IDs are assumed.
- The available automated-test command is not explained in the README.

Separate technical checks found 19 mocked-database tests, which were not run.
Seven backend JavaScript files passed syntax checks. These are not evidence
of successful database setup, live endpoints, or partner integration.

### Fixes made and gaps remaining
Added BLIND_TEST.md with preliminary findings and a live-test evidence template.
No partner-feedback changes to the MoneyMentor README have been confirmed or
made in this update. No HandyNear files were changed. Earlier author self-check
notes above are retained as historical notes, not newly rerun test results.

### Honest outcome
We cannot yet report whether another team obtained a working MoneyMentor response
using only our README. We also did not obtain a live HandyNear response in this
review. The required blind test remains incomplete. Use a tester with no prior
HandyNear context or choose another unfamiliar API, then record real requests,
responses, elapsed time, blockers and resulting documentation fixes. Confirm
whether the testing team is outside our ring or record the permitted substitution.

See BLIND_TEST.md for the pending procedure. No commit or push was performed
as part of this report update.

## 5. Week 8 local completion pass - 26 October 2026

API-key activities deferred; existing security was not changed.

- Part A: Rebuilt offline docs/index.html with inline Swagger assets. All six
  contract paths are embedded. Fresh visual inspection remains pending.
- Part B: Added a key-free PowerShell quickstart, actual response evidence and
  remote-access instructions. Existing protected-provider examples were retained,
  but not rerun. A fresh clean-clone setup was not performed.
- Parts C/D: Independent partner swap and README-only live test remain unverified.
- Part E: Updated report; no commit or push performed.

Fresh author checks: GET /api/health returned 200 and database connected;
GET /api/expenses returned 200 with 9 records; POST /api/expenses with an empty
object returned 400 and its validation message. The invalid POST did not create
a record. Evidence: docs/WEEK8_KEY_FREE_RESULTS.json.

No other team's success, timing or feedback is claimed. The independent blind
test and resulting feedback-driven fixes are still needed. Previous self-check
notes remain historical. API-key/protected-route activities are deferred in this
pass and no authentication was removed.


## HandyNear evidence clarification — 27 October 2026

The supplied [Week 10 evidence](docs/HANDYNEAR_INTEGRATION_EVIDENCE.md) establishes consumer integration with MoneyMentor on 26 October, including successful display and failure handling. It does not record a README-only attempt without assistance, elapsed blind-test time, or an outside-ring swap. It therefore belongs in INTEGRATION_LOG.md and does not close the Week 8 independent-test gap.
