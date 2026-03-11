# Changelog

## Unreleased

- Removed obsolete merchant-scoped integration methods from the active SDK surface.
- Aligned `merchant.get()` / `merchant.update()` types with the final merchant profile contract.
- Added program-scoped integration methods on `programs`: Stripe connect/disconnect and domain verification/status/removal.
- Added `webhooks` resource with list/create/get/update/delete/rotate-secret support.

## 1.0.5

- **Fix:** `merchant.updatePayoutInfo()` now sends `PATCH` instead of `PUT` to match the API contract.
- Added optional `include` parameter to `affiliates.get(id, { include: 'stats' })` for fetching aggregated stats.

## 1.0.4

- Added `search`, `sortBy`, `sortOrder`, `status` parameters to `affiliates.list()`.
- Added `trackingCode`, `skipOnboarding` parameters to `programs.createInvite()`.
- Added `merchant.getPayoutInfo()` and `merchant.updatePayoutInfo()` methods.
- Added `merchant.getNotifications()` and `merchant.updateNotifications()` methods.
- Added `PUT` to `HttpMethod` union type.
- Added new types: `AffiliateSortBy`, `SortOrder`, `CreateInviteParams`, `PayoutInfo`, `UpdatePayoutInfoParams`, `NotificationPreferences`, `UpdateNotificationPreferencesParams`.

## 1.0.3

- Hardened idempotency retry gate: POST retries now require a non-empty idempotency key.
- Added missing merchant API methods: merchant update/connectStripe, payouts create, programs marketplace/invites/coupon delete.
- Tightened contract types for core models and request/response shapes.

## 1.0.0

- Initial release.
- Typed HTTP client with strict retry/idempotency safeguards.
- Resource clients for programs, affiliates, conversions, payouts, flags, billing, merchant.
- Browser hard-fail protection by default.
