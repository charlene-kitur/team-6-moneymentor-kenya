# Week 4 Contract Questions

Reviewing team: MoneyMentor Kenya (Team 6)
Upstream provider: Prestige / Campus Lost and Found (Team 5)
Review date: 27 October 2026
Contract reviewed: https://github.com/guytresorgacheru-ops/prestige-webapp/blob/e33f537f64bde99678c8662a1a4299e39f6f6143/openapi.yaml
Compared with: separately supplied README (1).md.
Status: questions prepared for the producer; answers have not been received.

## 1. Which claim statuses are valid for the list endpoint?

In GET /claims, the required status query parameter has enum [claimed] and a
TODO about other values. PATCH /claims/{claimId} allows pending, claimed and
rejected, and the README also shows GET /claims?status=pending.

Should the GET status enum include pending and rejected? Please confirm the
response status and JSON error body for an omitted or unsupported status, and
update the contract accordingly. This affects which claims MoneyMentor can fetch
and whether an empty result is different from an invalid filter.

## 2. What authentication and error contract should we implement?

The supplied README requires X-API-Key and describes 401 and 429 responses, but
the reviewed OpenAPI file has no security scheme or security requirement and does
not describe those responses for GET /claims.

Please confirm that X-API-Key is required, the exact 401/429 JSON shapes, and the
Retry-After header type, then add them to the contract. MoneyMentor needs to send
the correct header from its backend and distinguish authentication failure from
rate limiting. No real key should be placed in the contract or reply document.

## 3. What does a successful refund creation return, and when is it rejected?

POST /claims/{claimId}/refunds lists a 201 description but no response schema.
Its amountCents integer has no minimum. The README describes a returned refund
object and a 409 when the claim has no fee or the refund exceeds the remaining fee.
Those conflict responses are absent from the contract.

Please specify the 201 fields, required fields, types and example (including
whether refundedAt is always present), whether amountCents must be positive,
and the exact 400/404/409 response bodies. This is necessary to avoid interpreting
a rejected refund as a completed financial action.
