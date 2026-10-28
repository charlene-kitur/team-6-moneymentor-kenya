# HandyNear Blind-Test Draft

Status: Preliminary review only; the README-only live blind test is pending.
Repository: https://github.com/Akipxxy/HandyNear_IAP
Reviewed revision: bad7951928914d40a096445f664a30b916605a35
Review date: 14 October 2026. Draft saved: 21 October 2026.

## README observations
- The repository URL was a placeholder and was supplied separately.
- Database setup instructions warn of missing table definitions.
- Response examples are illustrative, not captured live results.
- Example resource IDs are assumed rather than obtained from responses.
- Multiline curl examples use Bash syntax rather than PowerShell syntax.

## Separate source review — not blind-test evidence
The schema is at server/schema.sql, not the root location used in the README.
It contains inserts but no CREATE TABLE statements. Sample column names differ
from backend columns. All six documented operations have implementations.
Seven backend JavaScript files passed syntax checks. There are 19 automated
tests using a mocked database; Jest was not executed. These findings apply to
the reviewed revision, not a fresh check of the current branch.

## Live test procedure — pending
Since source code has already been inspected, use a tester without prior context
or choose another unfamiliar API to meet Part D's blind-test requirement.
1. Receive only the README and API access or local setup instructions.
2. Record the revision and start time.
3. Follow the README without asking questions or inspecting source code.
4. Attempt the quickstart: curl http://localhost:5000/api/handymen
5. Record the request, actual HTTP response or exact blocking step, and end time.
6. Stop after success or when the supplied instructions cannot be followed.

## Evidence to record
- Tester/team and whether outside our ring:
- Any permitted substitution and reason:
- README revision and date:
- Start/end time:
- API access method:
- Exact request:
- Actual HTTP status and response:
- Blocking step:
- Assistance or deviations:

## Current outcome
No live response was captured and elapsed test time was not measured. Runtime
endpoints, database persistence and partner integration remain unverified.
This document is a draft, not evidence of a completed live blind test.

## Prestige blind-test attempt — 27 October 2026

Repository: https://github.com/guytresorgacheru-ops/prestige-webapp
Revision: e33f537f64bde99678c8662a1a4299e39f6f6143 (main).
Instructions: separately supplied README (1).md.
Setup: isolated clone on our laptop; no producer files were modified.

The README instructs us to copy .env.example, run npm run db:setup, and
start the API before requesting GET /claims?status=claimed with X-API-Key.
Expected: 200 with claimId, studentId, itemId, status, rewardAmountCents and
submittedAt. This expected response was not obtained.

Observed results:
- Clone succeeded after switching Git from Windows TLS to OpenSSL for this command.
  The initial TLS credential error was a tester-machine issue.
- README.md and .env.example are absent from the checked repository revision.
- npm run db:setup failed: Missing script: "db:setup".
- npm test failed: Missing script: "test".
- package.json contains only start and dev scripts.

Outcome: blocked before making an API request. Dependencies were not installed
and the server was not started after confirming the missing setup prerequisites.
Package metadata and file names were inspected to confirm the blocker; no source
implementation was used to invent undocumented setup. No authentication was
bypassed and no producer key was used. Precise elapsed time was not captured;
time to first successful response is not applicable.

The supplied README does not match the repository revision. Request the matching
version or missing setup/configuration files. A working producer base URL would
allow a later request-based test; its deployment remains unverified here.
Prestige is our producer and prior context exists, so the Week 8 independent
outside-ring swap or permitted substitution remains unconfirmed. No independent
team's success with our README is claimed. Nothing was committed or pushed.
Earlier HandyNear notes above remain historical and concern a different project.
