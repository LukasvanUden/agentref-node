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
              logoUrl: null,
              billingTier: 'free',
              billingRequirementStatus: 'not_required',
              paymentStatus: 'active',
              lastPaymentFailedAt: null,
              defaultCookieDuration: 30,
              defaultPayoutThreshold: 5000,
              timezone: 'UTC',
              trackingRequiresConsent: true,
              trackingParamAliases: ['ref', 'partner'],
              trackingLegacyMetadataFallbackEnabled: true,
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
    expect(merchant.billingRequirementStatus).toBe('not_required')
    expect((merchant as Record<string, unknown>)['state']).toBeUndefined()
    expect((merchant as Record<string, unknown>)['verifiedDomain']).toBeUndefined()
  })

  it('programs.connectStripe posts to the program-scoped endpoint', async () => {
    let capturedBody: unknown
    server.use(
      http.post(`${BASE}/programs/prog_1/connect-stripe`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({
          data: {
            connected: false,
            method: 'oauth_url',
            programId: 'prog_1',
            authUrl: 'https://connect.stripe.com/oauth/authorize',
            message: 'Continue in Stripe.',
          },
          meta: { requestId: 'r' },
        })
      })
    )

    const result = await client.programs.connectStripe('prog_1', { method: 'oauth_url' })
    expect(capturedBody).toMatchObject({ method: 'oauth_url' })
    expect(result.programId).toBe('prog_1')
    expect(result.authUrl).toContain('stripe.com')
  })

  it('programs.verifyDomain unwraps the program-scoped response', async () => {
    server.use(
      http.post(`${BASE}/programs/prog_1/verify-domain`, () =>
        HttpResponse.json({
          data: {
            programId: 'prog_1',
            domain: 'agentref.dev',
            token: 'verify_me',
            txtRecord: 'verify_me',
            txtRecordName: '_agentref.agentref.dev',
            message: 'Add the TXT record.',
          },
          meta: { requestId: 'r' },
        })
      )
    )

    const result = await client.programs.verifyDomain('prog_1', { domain: 'agentref.dev' })
    expect(result.programId).toBe('prog_1')
    expect(result.txtRecordName).toBe('_agentref.agentref.dev')
  })

  it('programs.getDomainStatus unwraps the program-scoped status response', async () => {
    server.use(
      http.get(`${BASE}/programs/prog_1/verify-domain/status`, () =>
        HttpResponse.json({
          data: {
            verified: true,
            domain: 'agentref.dev',
            verifiedAt: '2026-01-01T00:00:00Z',
            programId: 'prog_1',
            programReadiness: 'ready',
            message: 'Domain verified.',
          },
          meta: { requestId: 'r' },
        })
      )
    )

    const result = await client.programs.getDomainStatus('prog_1')
    expect(result.verified).toBe(true)
    expect(result.programReadiness).toBe('ready')
  })

  it('programs.removeDomainVerification returns success', async () => {
    server.use(
      http.delete(`${BASE}/programs/prog_1/verify-domain`, () =>
        HttpResponse.json({
          data: { success: true },
          meta: { requestId: 'r' },
        })
      )
    )

    const result = await client.programs.removeDomainVerification('prog_1')
    expect(result.success).toBe(true)
  })

  it('programs.disconnectStripe returns success payload', async () => {
    server.use(
      http.delete(`${BASE}/programs/prog_1/connect-stripe`, () =>
        HttpResponse.json({
          data: { success: true, programId: 'prog_1' },
          meta: { requestId: 'r' },
        })
      )
    )

    const result = await client.programs.disconnectStripe('prog_1')
    expect(result.success).toBe(true)
    expect(result.programId).toBe('prog_1')
  })

  it('webhooks.create returns endpoint plus signing secret', async () => {
    server.use(
      http.post(`${BASE}/webhooks`, () =>
        HttpResponse.json(
          {
            data: {
              endpoint: {
                id: 'wh_1',
                name: 'Primary',
                url: 'https://example.com/webhooks',
                status: 'active',
                programId: 'prog_1',
                schemaVersion: 2,
                subscribedEvents: ['program.created'],
                secretLastFour: '1234',
                createdAt: '2026-01-01T00:00:00Z',
                updatedAt: '2026-01-01T00:00:00Z',
                disabledAt: null,
              },
              signingSecret: 'whsec_123',
            },
            meta: { requestId: 'r' },
          },
          { status: 201 }
        )
      )
    )

    const result = await client.webhooks.create({
      name: 'Primary',
      url: 'https://example.com/webhooks',
      programId: 'prog_1',
      subscribedEvents: ['program.created'],
      schemaVersion: 2,
    })

    expect(result.endpoint.programId).toBe('prog_1')
    expect(result.signingSecret).toBe('whsec_123')
  })

  it('webhooks.list filters by programId', async () => {
    server.use(
      http.get(`${BASE}/webhooks`, ({ request }) => {
        expect(new URL(request.url).searchParams.get('programId')).toBe('prog_1')
        return HttpResponse.json({
          data: [
            {
              id: 'wh_1',
              name: 'Primary',
              url: 'https://example.com/webhooks',
              status: 'active',
              programId: 'prog_1',
              schemaVersion: 2,
              subscribedEvents: ['program.created'],
              secretLastFour: '1234',
              createdAt: '2026-01-01T00:00:00Z',
              updatedAt: '2026-01-01T00:00:00Z',
              disabledAt: null,
            },
          ],
          meta: { requestId: 'r' },
        })
      })
    )

    const result = await client.webhooks.list({ programId: 'prog_1' })
    expect(result).toHaveLength(1)
    expect(result[0]?.schemaVersion).toBe(2)
  })

  it('webhooks.update and rotateSecret use the current webhook contract', async () => {
    server.use(
      http.patch(`${BASE}/webhooks/wh_1`, () =>
        HttpResponse.json({
          data: {
            id: 'wh_1',
            name: 'Renamed',
            url: 'https://example.com/webhooks',
            status: 'active',
            programId: null,
            schemaVersion: 2,
            subscribedEvents: ['program.updated'],
            secretLastFour: '1234',
            createdAt: '2026-01-01T00:00:00Z',
            updatedAt: '2026-01-02T00:00:00Z',
            disabledAt: null,
          },
          meta: { requestId: 'r' },
        })
      ),
      http.post(`${BASE}/webhooks/wh_1/rotate-secret`, () =>
        HttpResponse.json({
          data: {
            endpoint: {
              id: 'wh_1',
              name: 'Renamed',
              url: 'https://example.com/webhooks',
              status: 'active',
              programId: null,
              schemaVersion: 2,
              subscribedEvents: ['program.updated'],
              secretLastFour: '5678',
              createdAt: '2026-01-01T00:00:00Z',
              updatedAt: '2026-01-02T00:00:00Z',
              disabledAt: null,
            },
            signingSecret: 'whsec_456',
          },
          meta: { requestId: 'r' },
        })
      )
    )

    const updated = await client.webhooks.update('wh_1', {
      name: 'Renamed',
      programId: null,
      schemaVersion: 2,
      subscribedEvents: ['program.updated'],
    })
    const rotated = await client.webhooks.rotateSecret('wh_1')

    expect(updated.programId).toBeNull()
    expect(rotated.endpoint.secretLastFour).toBe('5678')
    expect(rotated.signingSecret).toBe('whsec_456')
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
