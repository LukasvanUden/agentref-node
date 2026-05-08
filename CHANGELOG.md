# Changelog

## Unreleased

- No unreleased changes.

## 5.1.1

- Aligned Affiliate Link examples and types with the live API response `code` field.

## 5.1.0

- Added full REST SDK coverage for Applications, Marketing Resources, Onboarding, Tracking, public Invites, Marketplace discovery/application, and the expanded Affiliate Workspace.
- Added top-level `notifications` and `payoutInfo` resources for parity with the Python SDK.
- Updated affiliate link creation to use `destinationPath` plus optional `customSlug`.
- Moved application review to `client.applications.approve/decline/block` and removed the stale affiliate approval helper from the active contract.
- Updated marketplace status types from `pending` to `draft` and added `partially_refunded` conversion status support.
- Updated README to document the complete v5.1.0 resource surface.

## 5.0.2

- Switched the default API host to `https://www.agentref.co/api/v1`.
- Removed stale domain-verification exports and legacy tracking fallback fields from the public SDK contract.
- Updated tests and README to match the active API surface and supported key prefixes.

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
