# Week 12 monitoring

## Predictions recorded before the Week 12 traffic run

Among the routes in our traffic mix, I expect GET /api/expenses to be slowest on average because it fetches and sorts database rows. I expect GET /api/not-a-route to account for the most 404 responses. Under a burst, the rate limiter could account for more errors than any individual endpoint because it rejects requests before routing.

## Observations from 3 November 2026

We ran a separate MoneyMentor API process on loopback port 5112 using the demo MySQL configuration and the team's issued key. The initial health check returned 503 with ECONNREFUSED while MySQL was stopped. After MySQL started, the same API served the database reads. The captured snapshot covers six diagnostic requests plus two randomized runs.

| Traffic run | 200 | 401 | 404 | 429 |
| --- | ---: | ---: | ---: | ---: |
| 60 requests | 40 | 9 | 11 | 0 |
| 200 requests | 105 | 30 | 28 | 37 |

The protected stats snapshot counted 266 completed requests, 119 client errors and one server error (0.4% after rounding). Average duration across all requests was 2.0 ms. The endpoint returns its snapshot before its own response finishes.

- Slowest average overall was the single failed health check at 14.2 ms. Among the three successful list endpoints, expenses was slowest as predicted, averaging 4.1 ms over 77 reads versus 2.0 ms for budgets and 1.8 ms for savings goals.
- The slowest individual call was the first successful expenses read at 177.7 ms. Opening a new MySQL connection after startup may explain it. Repeat the same read immediately after a restart and compare it with repeated reads on a warm pool.
- The missing path produced all 39 of the 404s. The largest error bucket was GET (no route), with 118 client errors: 42 intentional 401s, 39 missing-path 404s and 37 rate-limited 429s. The remaining client error was one deliberately invalid expense POST (400). None of these tests inserted an expense. The 401s came from our own scripted checks. A caller label alone cannot establish intent in production.
- The one 503 identifies a real dependency failure during startup. Subsequent successful database reads showed recovery. This short, deliberately failure-heavy run cannot establish a production baseline.
- Alert if 5xx responses exceed 3% over a five-minute window with at least 50 completed requests. Compute the rate from differences between snapshots, accounting for restarts. Notify the on-call teammate to check the failing route and database/partner connectivity. While Prestige is unavailable the rewards panel should show dated saved data, or the friendly unavailable message if its cache is empty.

## Log and stats evidence

See [sample log records](docs/evidence/WEEK12_LOG_SAMPLE.json) and [the captured stats response](docs/evidence/WEEK12_STATS.json). A valid key produced a stable six-character hash label; wrong and missing keys produced none. The logger includes timestamp, method, path, status, duration and caller label. Keys, tokens, passwords, query strings and bodies stay out of request logs. The raw requests.log is ignored. The stats are per process and reset when it restarts.

## Ring partner exercise

Pending external traffic from HandyNear, our downstream consumer. Provide the script in server/traffic.js and the current public MoneyMentor API base URL. Have HandyNear set API to that URL, KEY to their privately issued MoneyMentor key, and N to 60. Run node traffic.js from the script folder and share the status counts and test time. On the same API process serving the tunnel, capture the fingerprint distinct from ours and take a fresh /stats snapshot. Record the actual counts here after their run. Prestige is our upstream provider and is not needed for this exercise.
