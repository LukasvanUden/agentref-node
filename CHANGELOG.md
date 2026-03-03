# Changelog

## 1.0.3

- Hardened idempotency retry gate: POST retries now require a non-empty idempotency key.
- Added missing merchant API methods: merchant update/connectStripe, payouts create, programs marketplace/invites/coupon delete.
- Tightened contract types for core models and request/response shapes.

## 1.0.0

- Initial release.
- Typed HTTP client with strict retry/idempotency safeguards.
- Resource clients for programs, affiliates, conversions, payouts, flags, billing, merchant.
- Browser hard-fail protection by default.
