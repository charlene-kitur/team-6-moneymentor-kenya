# Week 11: resilience of Claimed-item rewards

## Scope and evidence
Tested on 3 November 2026 against a controlled HTTP partner implementing Prestige's /claims contract. This is controlled test evidence, not a completed real Prestige drill. The stand-in uses clearly artificial claim/student/item IDs. Existing real PARTNER_URL and credentials were not edited. Nothing was committed or pushed.

Raw timing, response, and sanitized log evidence: docs/evidence/WEEK11_BEFORE.json and WEEK11_AFTER.json. The Week 10 baseline already had a 10-second timeout; it was not an unlimited wait.

## Before and after
| Scenario | Before | After: user response | After log / upstream attempts |
| --- | --- | --- | --- |
| Normal | 14 ms, live | 14 ms, live, no banner | 1 call |
| Partner stopped (controlled process closed) | 502 in 7 ms | Saved rewards and timestamp banner in 636 ms | Connection failure twice, then connection refused; 3 attempts, no hits reach stopped server |
| Slow (10 seconds) | 502 after 10,056 ms | Saved rewards and timestamp banner after 5,139 ms | Two timeout retries, then timeout; 3 calls |
| Flaky (503 twice, then 200) | 502 on first attempt | Live rewards after 1,266 ms, no failure shown | Two HTTP 503 retry messages; 3 calls |
| Always HTTP 500 | 502 on first attempt | Saved rewards after 1,002 ms | Exactly two retries, then HTTP 500; 3 calls |
| Wrong schema | 502 | Saved rewards in 5 ms | Invalid response schema; 1 call |
| HTTP 401 | 502 | Saved rewards in 5 ms; log exposes auth failure | HTTP 401; 1 call, no retry |
| HTTP 429 with Retry-After: 1 | 502 | Live rewards after 1,119 ms | Wait 1,000 ms; 2 calls |
| Recovery | Live | Live, stale=false, new asOf | 1 call |
| Slow after fresh route/server (no cache) | 502 after 10,018 ms | Friendly unavailable message after 5,143 ms | Two retries then timeout; 3 calls |

The JSON verifies the response flags and retained timestamps. The React test checks that the saved banner appears, disappears on recovery, and loading ends on failure.

## Numbers and decisions
The initial direct normal request measured 197 ms before changes (132 ms in the after run). A 1,500 ms timeout leaves room for variation but cuts off a 10-second slow response. GET has at most 2 retries with 200 ms then 400 ms delays. Writes have zero retries, as do 400/401/403/404 and invalid JSON/schema. Other 5xx responses and connection failures may be retried. The timeout includes reading the JSON body.

Timeout-only worst-case budget: 3 x 1,500 + 200 + 400 = 5,100 ms, plus scheduling/HTTP overhead (measured 5,139-5,143 ms). This is acceptable for an optional, user-triggered rewards panel; other screens remain available. A 429 can extend this: Retry-After seconds or HTTP-date is honored up to 5 seconds per wait, giving a conservative 14,500 ms budget with two 5-second waits and three timeouts. If asked to wait longer than 5 seconds we return fallback without retrying early. Logs contain status/reason and delay, not URLs, keys, headers or response bodies.

## User impact without this code
On MoneyMentor's Claimed-item rewards screen, a student would click Load rewards and wait about ten seconds for a slow Prestige response. The panel would then show an unavailable message even if rewards had been loaded successfully earlier. A temporary 503 would require the student to click again manually, possibly several times. They might assume there are no reward records or leave the screen before seeing the values. The new saved-data timestamp makes it clear that old reward values are informational and are not confirmed wallet payments.

## What we did not build
A circuit breaker would stop calling a repeatedly failing partner and probe occasionally; ours has no circuit breaker and still makes up to three attempts on each eligible GET.

## Demonstrate locally
1. In a server terminal run `node flaky-partner.js` (port 4000).
2. In another server terminal run `node week11-demo.js` (port 3100).
3. Open http://127.0.0.1:3100 and click Load rewards in Claimed-item rewards.
4. Stop only the stand-in terminal with Ctrl+C; click Load rewards again: saved banner and timestamp appear.
5. Restart `node flaky-partner.js`; click Load rewards: live data returns and the banner disappears.
6. To test slow mode: `curl.exe http://127.0.0.1:4000/__mode/slow`. Modes also include flaky, error, bad, denied, limited, ok.
7. Restart only week11-demo.js while the partner is slow, then load: friendly unavailable message, no saved records.
8. Stop the two controlled-demo processes when finished. These commands do not alter real partner configuration or the consumer tunnel.

Repeat the measured HTTP tests: `node verify-week11.js` from server. This creates fresh controlled-process evidence and exits.

## Part E: still requires the partner
Arrange a window with Prestige and obtain their current URL. Start the real MoneyMentor web app using `npm.cmd run start:web`, load live rewards, ask Prestige to stop, reload for the saved banner, then ask them to restart and reload for live data. Record actual times and screenshots. Ask them to confirm at most three upstream attempts per reload. Observe HandyNear's calls to us during their reciprocal drill and check the Week 9 limit. Do not label the controlled tests as this real cross-team drill. No external team has been messaged or stopped by this work.

## Submission
Code, tests and notes are prepared locally. Real partner drill, its screenshots/call counts, and user-reviewed commit/push remain outstanding.

## Final validation
16 backend tests passed across partner, retry and web-gateway suites; 1 React UI test passed; production build compiled successfully. Browser verification showed saved rewards after deliberately stopping the controlled partner. Screenshot: docs/evidence/WEEK11_STOPPED_FALLBACK.png. The standalone demo at port 3100 uses artificial data and does not provide the Expense Tracker database routes.

