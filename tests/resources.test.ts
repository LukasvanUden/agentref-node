import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { AgentRef } from '../src/index.js'
import { ForbiddenError } from '../src/errors.js'

const BASE = 'https://www.agentref.dev/api/v1'
const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const client = new AgentRef({ apiKey: 'ak_live_test' })

describe('remaining resources', () => {
  it('affiliates.get unwraps envelope', async () => {
    server.use(
      http.get(`${BASE}/affiliates/aff_1`, () =>
        HttpResponse.json({ data: { id: 'aff_1' }, meta: { requestId: 'r' } })
      )
    )

    const result = await client.affiliates.get('aff_1')
    expect(result.id).toBe('aff_1')
  })

  it('payouts.listPending returns paginated envelope', async () => {
    server.use(
      http.get(`${BASE}/payouts/pending`, () =>
        HttpResponse.json({
          data: [{ affiliateId: 'aff_1' }],
          meta: { total: 1, page: 1, pageSize: 20, hasMore: false, requestId: 'r' },
        })
      )
    )

    const result = await client.payouts.listPending()
    expect(Array.isArray(result.data)).toBe(true)
    expect(result.meta.requestId).toBe('r')
  })

  it('flags.resolve forwards blockAffiliate true', async () => {
    let capturedBody: unknown

    server.use(
      http.post(`${BASE}/flags/flag_1/resolve`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({ data: { id: 'flag_1' }, meta: { requestId: 'r' } })
      })
    )

    await client.flags.resolve(
      'flag_1',
      { status: 'confirmed', note: 'confirmed fraud', blockAffiliate: true },
      { idempotencyKey: 'idem-flag-1' }
    )

    expect(capturedBody).toMatchObject({ status: 'confirmed', blockAffiliate: true })
  })

  it('billing.current unwraps envelope', async () => {
    server.use(
      http.get(`${BASE}/billing`, () =>
        HttpResponse.json({ data: { tier: 'free' }, meta: { requestId: 'r' } })
      )
    )

    const result = await client.billing.current()
    expect(result.tier).toBe('free')
  })

  it('merchant.domainStatus unwraps envelope', async () => {
    server.use(
      http.get(`${BASE}/merchant/domain-status`, () =>
        HttpResponse.json({ data: { domain: 'example.com', verified: true }, meta: { requestId: 'r' } })
      )
    )

    const result = await client.merchant.domainStatus()
    expect(result.verified).toBe(true)
  })

  it('403 propagates as ForbiddenError', async () => {
    server.use(
      http.get(`${BASE}/affiliates`, () =>
        HttpResponse.json(
          { error: { code: 'FORBIDDEN', message: 'Forbidden' }, meta: { requestId: 'r' } },
          { status: 403 }
        )
      )
    )

    await expect(client.affiliates.list()).rejects.toBeInstanceOf(ForbiddenError)
  })
})
