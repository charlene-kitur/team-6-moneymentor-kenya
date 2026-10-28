# Week 9 security audit

Date: 2026-10-27. Local author verification; no partner exchange or GitHub push.

- Added one randomly generated 192-bit key for the sole consumer, HandyNear.
  It is held in ignored server/.env.demo; no actual key appears in source/docs.
- All application data routes use X-API-Key middleware before JSON parsing.
  Missing/incorrect keys return 401. Only GET /api/health is intentionally public.
  CORS preflight is handled before authentication and returns no business data.
- Provider routes retain signed, expiring bearer tokens and provider ownership
  checks. A key alone cannot read another provider's financial data.
- SQL writes use placeholders and explicit fields. Responses select explicit
  fields; database credentials, signing secrets and API keys are not returned.
- Error logging now emits error codes rather than database exception messages.
  Client database errors remain generic. Upstream errors do not reveal keys.
- Rate limit is per key: 100/minute. Tests use 3 and confirm 200/200/200/429/429
  with Retry-After; a second ephemeral test key has an independent bucket.
- Existing invalid-body, ownership, missing-token and database-error tests pass.
- Local tracker tables are a shared demo dataset, not per-user financial storage.
  Anyone with the consumer key can access those local tracker routes. Only
  synthetic records should be kept there; production multi-user access requires
  an owner model. Provider tables have separate bearer-token ownership checks.
- Browser UI needs a server-side session/proxy before it can use protected routes;
  no consumer key was embedded in the frontend to bypass this restriction.
- In-memory limits reset on restart and do not coordinate multiple servers.
- Secret files are ignored. Historical Git commits have not been exhaustively
  audited for previously exposed secrets; no claim of a full history scan is made.

## Verification

102 Jest tests passed (12 suites); 3 legacy tests passed. No GitHub push performed.
Ten-record seed uses a transaction, preserves existing records, and is repeatable.
Provider 1 has ten sample income months, expenses, goals and investment records.
The producer's live authenticated integration cannot be certified without its key
and a working producer URL; the local stand-in tests are not a live partner test.


## Week 9 completion checks — 27 October 2026

- HandyNear remains the sole external consumer. Its key was preserved. Added a
  distinct own-team manual testing key, as Part A requires. Both stay in ignored
  .env.demo; API_KEYS is the allowlist, not a single request-header value.
- Actual HTTP output is saved in [WEEK9_HTTP_RESULTS.txt](docs/WEEK9_HTTP_RESULTS.txt):
  missing/wrong key 401, valid key 200, 200 200 200 429 429, positive Retry-After,
  JSON error, and independent consumer bucket. Used a temporary loopback instance
  with the real demo database; only that instance used limit 3. Config remains 100.
- Threshold rationale: 100/minute allows ordinary dashboard reads and manual lab
  testing while limiting rapid accidental loops; this is a simple course-scale
  policy, not a capacity benchmark or production denial-of-service guarantee.
- Fresh full run: 102 Jest tests / 12 suites passed; 3 legacy tests passed.
  Authenticated collection checks returned 10 records for each tested resource.
- Checked 87 reachable local-history text blobs up to 1MB for long configuration
  secret assignments and JWT literals. Three flagged blobs contain placeholder
  assignments; no confirmed live secret identified. See WEEK9_HISTORY_SCAN.json.
  This limited pattern check does not cover every secret format, unreachable
  objects, large binaries, remote-only history or external systems.
- The pre-existing browser authentication limitation remains: no secret was put
  into React source; its data calls still need an intentional browser access flow.

Remaining external/manual steps: restart the API serving the consumer so it loads
current code/configuration; privately send only HANDYNEAR_API_KEY to HandyNear;
ask them to use it alongside their bearer token and verify a real request.
Private distribution has not been performed by this assistant. No push made.
