# Contract Questions

## Upstream API

Prestige Lost & Found API

1. For `GET /claims`, what are all the allowed values for the `status` query parameter and the response `status` field? The query currently allows only `claimed`, while a comment mentions possible values such as `pending` and `resolved`.

2. For `GET /claims/{claimId}/refunds`, should `refundedAt` be required for every refund event? It has a `date-time` format and example, but it is missing from the response object's `required` list.

3. What authentication must MoneyMentor Kenya provide when calling these endpoints? The contract does not define a security scheme or document possible `401` and `403` responses.