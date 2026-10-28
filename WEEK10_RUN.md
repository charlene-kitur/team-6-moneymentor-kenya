# Week 10 live rewards demo

The rewards feature has been verified against Prestige's live API on 28 October
2026, including simulated unavailability and recovery. See INTEGRATION_LOG.md.

Open http://localhost:3000 and scroll to Claimed-item rewards. Click Load rewards.
The local web service is currently running in the background. If it is stopped:

```powershell
cd "C:\Users\wambu\OneDrive\Desktop\Team 6 money mentor\team-6-moneymentor-kenya"
npm.cmd run build
cd server
npm.cmd run start:web
```

The start:web command loads .env.demo, starts a separate protected API on a free
loopback port, and serves the built UI on 127.0.0.1:3000. It does not stop or
replace the existing consumer API on port 5001. Keep server/.env.demo private.
PARTNER_URL is the current producer base URL; PARTNER_API_KEY is its issued key;
PARTNER_DEMO=false. MONEYMENTOR_TEST_API_KEY is used only by the local gateway.
No REACT_APP_API_URL override is needed: the rewards panel uses its own origin.

Do not tunnel port 3000. This local demo does not implement remote user sessions.
The public consumer API retains its API-key and bearer-token checks.
The separate existing expense tracker uses port 5000; its setup is not repaired
by this rewards feature. The rest of the educational page remains available.

To repeat the failure exercise, privately save the real PARTNER_URL, change it
to an unused local address such as http://127.0.0.1:59999, restart start:web and
click Load rewards. Expect a clear unavailable message, not a blank page. Restore
the real URL and restart start:web; data should return without a code change.
This simulates an unavailable producer; it does not stop their actual server.

Current screenshots are in docs/evidence/week10-live.png, week10-failure.png and
week10-recovery.png. No source changes have been pushed by the assistant.
