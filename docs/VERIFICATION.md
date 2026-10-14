# Week 8 author verification (not a blind test)

Date: 2026-10-14. Source: local cloned repository.

## Generated reference
- npm.cmd run docs:build produced docs/index.html from openapi.yaml.
- Opened the generated file directly with file:// in headless Microsoft Edge.
- Verified all six operations expand with parameter/request and response sections.
- POST and PATCH show request bodies; GET and DELETE show parameters.
- 204 is documented without a response body.
- Zero remote asset requests and zero browser JavaScript errors.
- Inspected a rendered screenshot. Swagger UI license is retained alongside HTML.
- Read-only browsing avoids file-origin request restrictions; use README commands
  to execute live requests. No hosted site was created.

## Quickstart execution
A new isolated moneymentor_week8_demo database was created using setup-demo.js
and the existing local administrator configuration via --admin-env. Existing
normal project data was preserved. Generated runtime credentials/JWT secret are
in ignored .env.demo, not documentation. The API ran at 127.0.0.1:5001.

Extracted and executed the eight marked PowerShell blocks from README.md without
rewriting their commands: session/token, first GET, POST, PATCH, savings GET,
investments GET, DELETE and repeated DELETE. Requests succeeded; the first pass
exposed missing curl.exe, which was replaced by built-in Invoke-WebRequest.
Collection display was changed to raw response Content to avoid PS wrappers.

npm.cmd run docs:verify additionally asserted actual HTTP statuses and JSON:
- Income: 200, income 5000 and correct expense/net amounts.
- Expense creation: 201, exact owner and input fields.
- Partial update: 200, amount 3000, remaining fields preserved.
- Savings: 200, goal 1000, current 450, progress 45.
- Investments: 200, projected value 2395.08.
- Delete: 204, empty body; repeated delete: 404 with error string.
- Invalid month: 400; missing bearer token: 401.
The verifier removes only its own created expense. IDs may advance on reruns.

## Regression checks
- npm.cmd run test:demo: 10 Jest suites, 97 tests passed on the isolated demo.
- npm.cmd run test:legacy: 3 tests passed on the original development database.
- Production dependency audit: zero reported vulnerabilities after compatible
  proxy-addr and brace-expansion updates. Full audit still reports 22 development
  dependency findings (19 moderate, 3 high) in existing Jest/nodemon dependency
  chains. No forced major-version downgrade was applied as a documentation fix.

## Limits
This was author self-verification from the existing checkout with a fresh demo
database, not a different person's clean-clone exercise. Real cross-team blind
swap and testing remain pending. No external sharing, commit or push performed.
