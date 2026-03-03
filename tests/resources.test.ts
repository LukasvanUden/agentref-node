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

  it('payouts.create posts expected body', async () => {
    let capturedBody: unknown
    server.use(
      http.post(`${BASE}/payouts`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({ data: { id: 'pay_1' }, meta: { requestId: 'r' } }, { status: 201 })
      })
    )

    await client.payouts.create(
      { affiliateId: 'aff_1', programId: 'prog_1', method: 'paypal' },
      { idempotencyKey: 'idem-pay-1' }
    )
    expect(capturedBody).toMatchObject({ affiliateId: 'aff_1', programId: 'prog_1', method: 'paypal' })
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

  it('merchant.update sends PATCH payload', async () => {
    let capturedBody: unknown
    server.use(
      http.patch(`${BASE}/merchant`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json(
          {
            data: {
              id: 'merch_1',
              email: 'merchant@example.com',
              companyName: 'AgentRef Inc',
              domain: null,
              domainVerified: false,
              trustLevel: 'standard',
              stripeConnected: false,
              createdAt: '2026-01-01T00:00:00Z',
            },
            meta: { requestId: 'r' },
          }
        )
      })
    )

    await client.merchant.update({ companyName: 'AgentRef Inc' })
    expect(capturedBody).toMatchObject({ companyName: 'AgentRef Inc' })
  })

  it('merchant.connectStripe posts to connect endpoint', async () => {
    server.use(
      http.post(`${BASE}/merchant/connect-stripe`, () =>
        HttpResponse.json({ data: { url: 'https://connect.stripe.com/x' }, meta: { requestId: 'r' } })
      )
    )
    const result = await client.merchant.connectStripe()
    expect(result.url).toContain('stripe.com')
  })

  it('programs.listInvites returns invite list', async () => {
    server.use(
      http.get(`${BASE}/programs/prog_1/invites`, () =>
        HttpResponse.json({
          data: [
            {
              token: 'tok_1',
              email: 'affiliate@example.com',
              programId: 'prog_1',
              expiresAt: '2026-12-01T00:00:00Z',
              createdAt: '2026-01-01T00:00:00Z',
            },
          ],
          meta: { requestId: 'r' },
        })
      )
    )
    const result = await client.programs.listInvites('prog_1')
    expect(result).toHaveLength(1)
    expect(result[0]?.token).toBe('tok_1')
  })

  it('programs.updateMarketplace sends marketplace fields', async () => {
    let capturedBody: unknown
    server.use(
      http.patch(`${BASE}/programs/prog_1/marketplace`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({ data: { status: 'public' }, meta: { requestId: 'r' } })
      })
    )

    await client.programs.updateMarketplace('prog_1', { status: 'public', category: 'SaaS' })
    expect(capturedBody).toMatchObject({ status: 'public', category: 'SaaS' })
  })

  it('programs.deleteCoupon calls coupon delete endpoint', async () => {
    server.use(
      http.delete(`${BASE}/coupons/coup_1`, () =>
        HttpResponse.json({
          data: {
            id: 'coup_1',
            code: 'SAVE10',
            affiliateId: 'aff_1',
            programId: 'prog_1',
            createdAt: '2026-01-01T00:00:00Z',
          },
          meta: { requestId: 'r' },
        })
      )
    )
    const coupon = await client.programs.deleteCoupon('coup_1')
    expect(coupon.id).toBe('coup_1')
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
