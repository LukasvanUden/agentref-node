# AgentRef Node SDK

Official TypeScript/JavaScript SDK for the AgentRef REST API v1.

## Install

```bash
npm install agentref
```

## Quickstart

```ts
import { AgentRef } from 'agentref'

const client = new AgentRef({ apiKey: 'ak_live_...' })
const programs = await client.programs.list()
console.log(programs.meta.requestId)
```

## Affiliate workspace quickstart

```ts
import { AgentRef } from 'agentref'

const client = new AgentRef({ apiKey: 'ak_aff_...' })
const overview = await client.affiliateWorkspace.overview()
const programs = await client.affiliateWorkspace.listPrograms()
const firstProgram = programs[0]

if (firstProgram) {
  const detail = await client.affiliateWorkspace.getProgram(firstProgram.programId)
  const link = await client.affiliateWorkspace.createLink(
    { name: 'Pricing', destinationPath: '/pricing', customSlug: 'jane-review' },
    { programId: detail.programId, idempotencyKey: 'create-pricing-link' }
  )
  console.log(overview.programCount, detail.programName, link.code)
}
```

## Authentication

- API key is sent as `Authorization: Bearer <key>`.
- Supported key prefixes: `ak_onb_*`, `ak_live_*`, `ak_aff_*`.
- You can pass `apiKey` directly or use `AGENTREF_API_KEY`.
- Default behavior hard-fails in browser contexts to prevent API key exposure.

## Resources

- `client.programs`
  - `list`, `listAll`, `get`, `create`, `update`, `delete`, `stats`, `listAffiliates`, `listCoupons`, `createCoupon`, `deleteCoupon`, `listInvites`, `createInvite`, `updateMarketplace`, `connectStripe`, `disconnectStripe`
- `client.applications`
  - `list`, `get`, `approve`, `decline`, `block`
- `client.affiliateWorkspace`
  - `overview`, `identity`, `listPrograms`, `getProgram`, `earnings`, `listProgramEarnings`, `listPayouts`, `listLinks`, `createLink`, `updateLink`, `deleteLink`, `clickStats`
- `client.marketingResources`
  - `list`, `createSocialPost`, `updateSocialPost`, `createSocialPostMediaUploadSession`, `completeSocialPostMediaUpload`, `reorderSocialPostMedia`, `updateSocialPostMedia`, `removeSocialPostMedia`, `replaceSocialPostMedia`, `publish`, `unpublish`, `archive`, `notifyAffiliates`, `createDownloadUrl`, `listForAffiliate`, `getForAffiliate`, `createAffiliateDownloadUrl`, `renderSocialPost`
- `client.affiliates`
  - `list`, `get`, `block`, `unblock`
- `client.conversions`
  - `list`, `stats`, `recent`
- `client.payouts`
  - `list`, `listPending`, `stats`, `create`
- `client.flags`
  - `list`, `stats`, `resolve`
- `client.billing`
  - `current`, `tiers`, `subscribe`
- `client.merchant`
  - `get`, `update`
- `client.notifications`
  - `get`, `update`
- `client.payoutInfo`
  - `get`, `update`
- `client.onboarding`
  - `upsertMerchantProfile`, `complete`
- `client.tracking`
  - `getProgramStatus`
- `client.invites`
  - `get`, `claim`
- `client.marketplace`
  - `listPrograms`, `apply`
- `client.webhooks`
  - `list`, `create`, `get`, `update`, `delete`, `rotateSecret`

## Applications

Pending affiliate joins are application records. Use `client.applications` to approve,
decline, or block applications before they become approved affiliate memberships.

```ts
const pending = await client.applications.list({ programId: 'prog-uuid', status: 'pending' })
await client.applications.approve(
  pending.data[0]!.id,
  { note: 'Relevant SaaS audience.' },
  { idempotencyKey: 'approve-app-1' }
)
```

## Marketing Resources

Merchant keys can manage resources. Affiliate keys can list, download, and render
published resources for joined programs.

```ts
const post = await client.marketingResources.createSocialPost(
  'prog-uuid',
  {
    title: 'Launch copy',
    body: 'Try AgentRef: {{affiliate_link}}',
    platforms: ['linkedin'],
    status: 'published',
  },
  { idempotencyKey: 'mr-social-launch' }
)

await client.marketingResources.publish(
  post.id,
  { programId: 'prog-uuid', notifyAffiliates: true },
  { idempotencyKey: 'publish-mr-social-launch' }
)

const rendered = await client.marketingResources.renderSocialPost(post.id, {
  programId: 'prog-uuid',
  affiliateLinkId: 'link-uuid',
})
```

## Marketplace, Invites, Onboarding, and Tracking

```ts
await client.onboarding.upsertMerchantProfile({ companyName: 'Acme Inc.' })
await client.onboarding.complete()

const tracking = await client.tracking.getProgramStatus('prog-uuid')
const invite = await client.invites.get('invite-token')
const claimed = await client.invites.claim(invite.token)

const marketplace = await client.marketplace.listPrograms({ sort: 'commission' })
await client.marketplace.apply(marketplace.data[0]!.programId!, {
  message: 'I manage affiliate agents for SaaS products.',
})
```

## Pagination

List endpoints return:

```ts
{
  data: T[]
  meta: {
    total: number
    page: number
    pageSize: number
    hasMore: boolean
    nextCursor?: string
    requestId: string
  }
}
```

For auto-pagination use `listAll()`. Stop condition is `meta.hasMore === false`.

## Idempotency

POST methods with server idempotency support accept `options?: { idempotencyKey?: string }`.

- If set, `Idempotency-Key` is sent.
- Retries for mutating requests are only enabled for POST + `idempotencyKey`.
- PATCH/DELETE are never auto-retried.

## Error Handling

```ts
import { AgentRef, ForbiddenError, NotFoundError, RateLimitError, AgentRefError } from 'agentref'

const client = new AgentRef({ apiKey: 'ak_live_...' })

try {
  await client.programs.get('unknown')
} catch (error) {
  if (error instanceof ForbiddenError) console.log(error.code)
  if (error instanceof NotFoundError) console.log(error.requestId)
  if (error instanceof RateLimitError) console.log(error.retryAfter)
  if (error instanceof AgentRefError) console.log(error.status)
}
```

## Configuration

| Option | Default | Description |
|---|---|---|
| `apiKey` | `process.env.AGENTREF_API_KEY` | API key |
| `baseUrl` | `https://www.agentref.co/api/v1` | Base API URL |
| `timeout` | `30000` | Request timeout in ms |
| `maxRetries` | `2` | Retry count for GET/HEAD and POST+idempotencyKey |
| `dangerouslyAllowBrowser` | `false` | Allows browser initialization (unsafe) |
