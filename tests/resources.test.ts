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
        HttpResponse.json({
          data: {
            status: 'verified',
            domain: 'example.com',
            txtRecord: null,
            verifiedAt: '2026-01-01T00:00:00Z',
            trackingMode: 'advanced',
            advancedTrackingEnabled: true,
          },
          meta: { requestId: 'r' },
        })
      )
    )

    const result = await client.merchant.domainStatus()
    expect(result.status).toBe('verified')
    expect(result.trackingMode).toBe('advanced')
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
              userId: 'user_1',
              companyName: 'AgentRef Inc',
              website: 'https://agentref.dev',
              logoUrl: null,
              stripeAccountId: null,
              stripeConnectedAt: null,
              billingTier: 'free',
              stripeCustomerId: null,
              stripeSubscriptionId: null,
              paymentStatus: 'active',
              lastPaymentFailedAt: null,
              defaultCookieDuration: 30,
              defaultPayoutThreshold: 5000,
              timezone: 'UTC',
              trackingRequiresConsent: true,
              trackingParamAliases: ['ref', 'partner'],
              trackingLegacyMetadataFallbackEnabled: true,
              state: 'verified',
              verifiedDomain: 'agentref.dev',
              domainVerificationToken: null,
              domainVerifiedAt: '2026-01-01T00:00:00Z',
              notificationPreferences: { newAffiliate: true },
              onboardingCompleted: true,
              onboardingStep: 4,
              createdAt: '2026-01-01T00:00:00Z',
              updatedAt: '2026-01-02T00:00:00Z',
            },
            meta: { requestId: 'r' },
          }
        )
      })
    )

    const merchant = await client.merchant.update({
      companyName: 'AgentRef Inc',
      trackingRequiresConsent: true,
      trackingParamAliases: ['ref', 'partner'],
    })
    expect(capturedBody).toMatchObject({
      companyName: 'AgentRef Inc',
      trackingRequiresConsent: true,
      trackingParamAliases: ['ref', 'partner'],
    })
    expect(merchant.state).toBe('verified')
    expect(merchant.verifiedDomain).toBe('agentref.dev')
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

  it('programs.stats unwraps current stats shape', async () => {
    server.use(
      http.get(`${BASE}/programs/prog_1/stats`, () =>
        HttpResponse.json({
          data: {
            programId: 'prog_1',
            programName: 'Growth Program',
            status: 'active',
            totalRevenue: 25000,
            totalConversions: 12,
            totalCommissions: 5000,
            pendingCommissions: 1200,
            activeAffiliates: 3,
            conversionsByStatus: {
              pending: 1,
              approved: 10,
              rejected: 1,
              refunded: 0,
            },
          },
          meta: { requestId: 'r' },
        })
      )
    )

    const result = await client.programs.stats('prog_1')
    expect(result.programId).toBe('prog_1')
    expect(result.conversionsByStatus.approved).toBe(10)
  })

  it('merchant.getPayoutInfo unwraps bank transfer fields', async () => {
    server.use(
      http.get(`${BASE}/me/payout-info`, () =>
        HttpResponse.json({
          data: {
            payoutMethod: 'bank_transfer',
            paypalEmail: null,
            bankAccountHolder: 'Jane Doe',
            bankIban: '****1234',
            bankBic: 'COBADEFFXXX',
            firstName: 'Jane',
            lastName: 'Doe',
            addressLine1: 'Main Street 1',
            addressLine2: null,
            city: 'Berlin',
            state: null,
            postalCode: '10115',
            vatId: 'DE123',
          },
          meta: { requestId: 'r' },
        })
      )
    )

    const result = await client.merchant.getPayoutInfo()
    expect(result.bankAccountHolder).toBe('Jane Doe')
    expect(result.bankBic).toBe('COBADEFFXXX')
  })

  it('merchant.updatePayoutInfo sends bank transfer fields', async () => {
    let capturedBody: unknown

    server.use(
      http.patch(`${BASE}/me/payout-info`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({
          data: {
            payoutMethod: 'bank_transfer',
            paypalEmail: null,
            bankAccountHolder: 'Jane Doe',
            bankIban: '****1234',
            bankBic: 'COBADEFFXXX',
            firstName: 'Jane',
            lastName: 'Doe',
            addressLine1: 'Main Street 1',
            addressLine2: null,
            city: 'Berlin',
            state: null,
            postalCode: '10115',
            vatId: 'DE123',
          },
          meta: { requestId: 'r' },
        })
      })
    )

    await client.merchant.updatePayoutInfo({
      payoutMethod: 'bank_transfer',
      bankAccountHolder: 'Jane Doe',
      bankIban: 'DE89370400440532013000',
      bankBic: 'COBADEFFXXX',
    })

    expect(capturedBody).toMatchObject({
      payoutMethod: 'bank_transfer',
      bankAccountHolder: 'Jane Doe',
      bankIban: 'DE89370400440532013000',
      bankBic: 'COBADEFFXXX',
    })
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
