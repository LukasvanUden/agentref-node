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

## Authentication

- API key is sent as `Authorization: Bearer <key>`.
- Supported key prefixes: `ak_live_*`, `ak_aff_*`.
- You can pass `apiKey` directly or use `AGENTREF_API_KEY`.
- Default behavior hard-fails in browser contexts to prevent API key exposure.

## Resources

- `client.programs`
  - `list`, `listAll`, `get`, `create`, `update`, `delete`, `stats`, `listAffiliates`, `listCoupons`, `createCoupon`, `deleteCoupon`, `listInvites`, `createInvite`, `updateMarketplace`, `connectStripe`, `disconnectStripe`, `verifyDomain`, `removeDomainVerification`, `getDomainStatus`
- `client.affiliates`
  - `list`, `get`, `approve`, `block`, `unblock`
- `client.conversions`
  - `list`, `stats`, `recent`
- `client.payouts`
  - `list`, `listPending`, `stats`, `create`
- `client.flags`
  - `list`, `stats`, `resolve`
- `client.billing`
  - `current`, `tiers`, `subscribe`
- `client.merchant`
  - `get`, `update`, `getPayoutInfo`, `updatePayoutInfo`, `getNotifications`, `updateNotifications`
- `client.webhooks`
  - `list`, `create`, `get`, `update`, `delete`, `rotateSecret`

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
| `baseUrl` | `https://www.agentref.dev/api/v1` | Base API URL |
| `timeout` | `30000` | Request timeout in ms |
| `maxRetries` | `2` | Retry count for GET/HEAD and POST+idempotencyKey |
| `dangerouslyAllowBrowser` | `false` | Allows browser initialization (unsafe) |
