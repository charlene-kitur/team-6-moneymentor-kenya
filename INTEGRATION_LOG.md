# Week 10 Integration Log

Date: 27 October 2026
Consumer: MoneyMentor Kenya. Producer: Group 5 / Prestige.
Feature: claimed-item reward panel. Money values stay in cents; 1500 cents is
15.00 whole currency units. This is not proof that a wallet payment occurred.

## Scope and preflight
API-key issuance, storage and sending are omitted at the user's request.
Existing MoneyMentor authentication is unchanged. No commits or pushes made.
The supplied Prestige README requires X-API-Key for claims. Therefore this
key-free version cannot claim live protected integration is complete.
Fields are based on the supplied README; alignment with the producer's latest
OpenAPI contract still needs confirmation.
Partner contact/TA check-in scheduling is for the team to arrange.

## First live call (earlier today)
At 10:37:55 EAT, GET
https://son-happen-tabs-jury.trycloudflare.com/health
failed with getaddrinfo failed (Errno 11001) after 3.19 seconds. No HTTP response
was received. The supplied URL could not resolve from this machine. No provider
writes were attempted. A new verified URL remains required.

## Implementation
Frontend PartnerRewards calls only MoneyMentor's /api/partner/rewards.
Backend reads PARTNER_URL from its environment and requests /claims?status=claimed.
It validates the returned fields, returns only required data, and responds with
502 and a friendly message for failures. No retries or timeouts were added.
A local stand-in is explicitly permitted by the handout when the producer is
unavailable. The included stand-in uses the README example, not live producer data.

## Bugs, surprises and deliberate checks
| # | Symptom | Root cause | Fix / next action | Whose code / who fixed it |
|---|---------|------------|-------------------|-------------------------|
| 1 | Producer URL cannot be reached | Hostname resolution failed; reason the hostname is unavailable is unconfirmed | Request a current reachable URL; local stand-in used meanwhile | Producer/network; pending |
| 2 | Claims cannot be exercised without credentials | README requires a key; key work intentionally excluded | Keep live integration pending; do not remove authentication | Scope limitation, not a producer bug |
| 3 | Deliberately stopped stand-in | ECONNREFUSED | Backend returns 502 and clear message; independent health route remains 200 | Consumer implementation, verified locally |
| 4 | Deliberately changed response field names | PARTNER_SHAPE_MISMATCH | Reject incompatible response instead of showing undefined values | Consumer validation, verified locally |
| 5 | Simulated provider rejection | Stand-in returned 401, no real key used | Return friendly 502 instead of pretending an empty list is success | Consumer error handling, verified locally |

## Verification
Three Jest tests passed: real local HTTP stand-in success -> stopped -> recovery;
wrong response shape; simulated provider rejection. An unrelated health route
remained 200 while the stand-in was stopped. Recovery used the same URL and no
code change. Sample c1/s1/i1 returned rewardAmountCents=1500.
App.js and PartnerRewards.js passed JSX parser checks.
The browser UI and production frontend build were not verified in this pass:
this checkout has no frontend node_modules installed. Browser rehearsal remains
pending; backend automated checks do not prove a visual demo occurred.

## Downstream support already recorded in this chat
On 26 October the consumer reported a dropped tunnel and asked for provider-1
savings access. The tunnel was restored and a public authenticated savings request
returned 200 with goal 1000, current amount 450 and progress 45. This is historical
support evidence; it is not a fresh availability check or a new key exercise.

## Demo and remaining work
Follow WEEK10_RUN.md to rehearse with the local stand-in. Then obtain a current
producer URL and complete the deferred authentication before claiming a live
end-to-end result. Confirm contract alignment, rehearse the actual browser
working/down/recovered sequence, and record real partner collaboration.
No success is claimed for the live producer or its database.


## Consumer evidence received — 27 October 2026

[HandyNear evidence summary](docs/HANDYNEAR_INTEGRATION_EVIDENCE.md) and its linked original document record work on 26 October. The screenshots show a 200 from HandyNear's proxy and its dashboard displaying MoneyMentor savings of KES 450 / 1,000 (45%), plus 502 and a friendly failure display. Recovery is reported after the tunnel URL was updated. This confirms downstream consumption of our savings endpoint at that time, not our upstream Prestige integration.

| Symptom | Root cause / evidence | Resolution | Responsibility |
|---|---|---|---|
| Temporary URL returned no tunnel | Tunnel unavailable, reported by HandyNear | MoneyMentor restarted tunnel and supplied new URL | MoneyMentor hosting |
| Direct savings call returned 401 | Bearer token missing; matches then-current contract | Supplied provider-1 JWT; HandyNear sent Authorization header | Both teams |
| Consumer displayed unavailable message | Partner request failed; screenshots show 502 and ECONNREFUSED separately | HandyNear handled error; changing URL restored data as reported | HandyNear handling; MoneyMentor availability |
| URLs changed and JWT expired after one hour | Temporary tunnel and expiring token | Environment configuration allowed replacement without code changes | Both teams |

Current follow-up: the new X-API-Key layer requires HandyNear to add a second header and retest. This has not been evidenced. Historical key-free scope notes above describe the earlier pass; the backend now supports PARTNER_API_KEY, and api-security.js protects MoneyMentor data routes. A live Prestige key/URL and browser integration remain outstanding. The current backend includes a 10-second upstream timeout; the earlier statement that no timeout exists is historical (Week 10 itself says to defer timeout work).

## Live Prestige connection — 28 October 2026

Using the user-supplied producer key and current tunnel, GET /claims?status=claimed
returned HTTP 200: one record with claimId "1", studentId "SU-1001", itemId "1",
status "claimed", rewardAmountCents 15000. Values match the panel's expected
string IDs and integer cents (150.00 whole units). See docs/PRESTIGE_LIVE_CHECK.json.
PARTNER_URL and PARTNER_API_KEY are stored in ignored server/.env.demo;
PARTNER_DEMO=false. No credentials are recorded here.
This establishes successful authenticated producer retrieval. The main running
server needs restarting to load the updated environment. Browser access-flow
repair and the live failure/recovery demonstration remain outstanding.


## Live browser integration completed — 28 October 2026

MoneyMentor's Claimed-item rewards panel displayed actual Prestige data: claim 1,
student SU-1001, item 1, 15000 cents / 150.00 whole units. Browser requests go to
the same-origin loopback web gateway. The gateway adds the own-team key on the
server and calls a separate protected loopback API instance; that API sends the
producer key to Prestige. No key is embedded in React or returned to the browser.

| Check | Actual result |
|---|---|
| Live browser call | Partner API label and reward row displayed; backend HTTP 200. |
| Failure exercise | Temporarily set PARTNER_URL to http://127.0.0.1:59999 and restarted only the local web service. This simulates an unavailable partner; Prestige was not stopped. |
| Failure display | Friendly unavailable message; rewards route 502; page route / still 200; log ECONNREFUSED. |
| Recovery | Restored the real Prestige URL and restarted the local web service without code changes. Reloading rewards displayed the real row again. |
| Build | npm run build compiled successfully. |
| Regression suite | 13 Jest suites, 104 tests passed. |
| Browser secret check | Four JS/HTML/source-map build files checked against configured API-key values; none found. |

Evidence: [live](docs/evidence/week10-live.png),
[failure](docs/evidence/week10-failure.png),
[recovery](docs/evidence/week10-recovery.png).

The gateway is a local team demonstration interface, bound to 127.0.0.1:3000.
It accepts only local Host/Origin values and exposes only the rewards proxy, not
a generic API proxy. Do not tunnel port 3000. Remote multi-user hosting needs
user/session authentication. The existing port-5001 API could not be restarted
by this process (Windows access denied); it was left running. The local web app
uses current code/configuration in its own protected listener. Existing expense
tracker still targets port 5000 and showed a pre-existing fetch error; it was not
part of this feature and is not claimed fixed.

No commit or push. The old pending-browser statements above are historical and
are superseded by these observed results. Partner contact/TA check-in and new
HandyNear authentication retest are not established by this browser test.

## Replacement tunnel check — 28 October 2026

Updated the private producer base URL to
https://specially-specified-topic-org.trycloudflare.com and restarted the local
web service. An authenticated GET /claims?status=claimed returned HTTP 530 with
a Cloudflare Tunnel error page (error 1033), not the producer's JSON response.
Recovery is not confirmed. Prestige must restore its tunnel/API and confirm the
current URL. Existing producer key retained; no key included in this log.

## 3 November 2026 - Week 11 resilience
Controlled before/after HTTP checks are in docs/evidence/WEEK11_BEFORE.json and WEEK11_AFTER.json. Added bounded GET retries, 1.5 s attempt timeout, validated in-memory fallback and dated UI banner. Slow fallback measured 5.139 s; flaky succeeded on attempt three. 401/schema errors were not retried. See RESILIENCE_NOTES.md; real Prestige stop/restart drill remains pending. Existing real partner settings and consumer tunnel were not changed.
