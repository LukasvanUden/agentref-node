import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { AgentRef } from '../src/index.js'

const BASE = 'https://www.agentref.co/api/v1'
const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const client = new AgentRef({ apiKey: 'ak_live_test' })

describe('complete SDK surface', () => {
  it('applications list and review use the applications lifecycle', async () => {
    let capturedListStatus = ''
    let capturedApproveBody: unknown
    let capturedIdempotency = ''

    server.use(
      http.get(`${BASE}/applications`, ({ request }) => {
        const url = new URL(request.url)
        capturedListStatus = url.searchParams.get('status') ?? ''
        return HttpResponse.json({
          data: [{ id: 'app_1', status: 'pending' }],
          meta: { total: 1, page: 1, pageSize: 20, hasMore: false, requestId: 'r' },
        })
      }),
      http.post(`${BASE}/applications/app_1/approve`, async ({ request }) => {
        capturedApproveBody = await request.json()
        capturedIdempotency = request.headers.get('idempotency-key') ?? ''
        return HttpResponse.json({ data: { id: 'app_1', status: 'approved' }, meta: { requestId: 'r' } })
      })
    )

    const applications = await client.applications.list({ status: 'pending' })
    const approved = await client.applications.approve(
      'app_1',
      { note: 'looks good' },
      { idempotencyKey: 'idem-app-1' }
    )

    expect(capturedListStatus).toBe('pending')
    expect(applications.data[0]?.id).toBe('app_1')
    expect(capturedApproveBody).toMatchObject({ note: 'looks good' })
    expect(capturedIdempotency).toBe('idem-app-1')
    expect(approved.status).toBe('approved')
  })

  it('affiliate workspace exposes links, earnings, payouts, clicks, and identity', async () => {
    let capturedLinkBody: unknown
    let capturedProgram = ''

    server.use(
      http.get(`${BASE}/me`, () =>
        HttpResponse.json({ data: { key: { ownerType: 'affiliate' }, owner: { affiliateId: 'aff_1' } }, meta: {} })
      ),
      http.get(`${BASE}/me/earnings`, () => HttpResponse.json({ data: { total: 100 }, meta: {} })),
      http.get(`${BASE}/me/earnings/prog_1`, () =>
        HttpResponse.json({
          data: [{ id: 'earn_1', amount: 100 }],
          meta: { total: 1, page: 1, pageSize: 20, hasMore: false, requestId: 'r' },
        })
      ),
      http.get(`${BASE}/me/payouts`, () =>
        HttpResponse.json({
          data: [{ id: 'pay_1' }],
          meta: { total: 1, page: 1, pageSize: 20, hasMore: false, requestId: 'r' },
        })
      ),
      http.get(`${BASE}/me/clicks`, ({ request }) => {
        capturedProgram = new URL(request.url).searchParams.get('program_id') ?? ''
        return HttpResponse.json({ data: { totalClicks: 4 }, meta: {} })
      }),
      http.post(`${BASE}/me/links`, async ({ request }) => {
        capturedLinkBody = await request.json()
        capturedProgram = new URL(request.url).searchParams.get('program_id') ?? ''
        return HttpResponse.json({ data: { id: 'link_1', code: 'jane-review' }, meta: {} }, { status: 201 })
      })
    )

    const identity = await client.affiliateWorkspace.identity()
    const earnings = await client.affiliateWorkspace.earnings()
    const programEarnings = await client.affiliateWorkspace.listProgramEarnings('prog_1')
    const payouts = await client.affiliateWorkspace.listPayouts()
    const clicks = await client.affiliateWorkspace.clickStats({ programId: 'prog_1' })
    const link = await client.affiliateWorkspace.createLink(
      { name: 'Pricing', destinationPath: '/pricing', customSlug: 'jane-review' },
      { programId: 'prog_1', idempotencyKey: 'idem-link-1' }
    )

    expect(identity.key.ownerType).toBe('affiliate')
    expect(earnings.total).toBe(100)
    expect(programEarnings.data[0]?.id).toBe('earn_1')
    expect(payouts.data[0]?.id).toBe('pay_1')
    expect(clicks.totalClicks).toBe(4)
    expect(capturedProgram).toBe('prog_1')
    expect(capturedLinkBody).toMatchObject({
      name: 'Pricing',
      destination_path: '/pricing',
      custom_slug: 'jane-review',
    })
    expect(link.code).toBe('jane-review')
  })

  it('marketingResources supports merchant and affiliate workflows', async () => {
    let capturedCreateBody: unknown
    let capturedRenderBody: unknown

    server.use(
      http.get(`${BASE}/programs/prog_1/marketing-resources`, ({ request }) => {
        expect(new URL(request.url).searchParams.get('kind')).toBe('social_posts')
        return HttpResponse.json({ data: [{ id: 'res_1', kind: 'social_post' }], meta: {} })
      }),
      http.post(`${BASE}/programs/prog_1/marketing-resources/social-posts`, async ({ request }) => {
        capturedCreateBody = await request.json()
        return HttpResponse.json({ data: { id: 'res_1', title: 'Launch' }, meta: {} }, { status: 201 })
      }),
      http.post(`${BASE}/marketing-resources/res_1/publish`, async ({ request }) => {
        return HttpResponse.json({ data: { resource: await request.json(), notification: { requested: true } }, meta: {} })
      }),
      http.get(`${BASE}/me/programs/prog_1/marketing-resources`, () =>
        HttpResponse.json({ data: [{ id: 'res_1', title: 'Launch' }], meta: {} })
      ),
      http.post(`${BASE}/me/marketing-resources/social-posts/res_1/render`, async ({ request }) => {
        capturedRenderBody = await request.json()
        return HttpResponse.json({ data: { body: 'Post https://ref.example/link', disclosure: '#ad' }, meta: {} })
      })
    )

    const resources = await client.marketingResources.list('prog_1', { kind: 'social_posts' })
    const created = await client.marketingResources.createSocialPost(
      'prog_1',
      { title: 'Launch', body: 'Try {{affiliate_link}}', platforms: ['linkedin'], status: 'published' },
      { idempotencyKey: 'idem-mr-1' }
    )
    const published = await client.marketingResources.publish(
      'res_1',
      { programId: 'prog_1', notifyAffiliates: true },
      { idempotencyKey: 'idem-publish-1' }
    )
    const affiliateResources = await client.marketingResources.listForAffiliate('prog_1')
    const rendered = await client.marketingResources.renderSocialPost('res_1', {
      programId: 'prog_1',
      affiliateLinkId: 'link_1',
    })

    expect(resources[0]?.id).toBe('res_1')
    expect(created.title).toBe('Launch')
    expect(capturedCreateBody).toMatchObject({
      title: 'Launch',
      body: 'Try {{affiliate_link}}',
      platforms: ['linkedin'],
      status: 'published',
    })
    expect(published.notification.requested).toBe(true)
    expect(affiliateResources[0]?.id).toBe('res_1')
    expect(capturedRenderBody).toMatchObject({ program_id: 'prog_1', affiliate_link_id: 'link_1' })
    expect(rendered.disclosure).toBe('#ad')
  })

  it('onboarding, tracking, invites, marketplace, notifications, and payoutInfo are top-level resources', async () => {
    server.use(
      http.post(`${BASE}/onboarding/merchant`, async ({ request }) =>
        HttpResponse.json({ data: { merchantId: 'merch_1', ...(await request.json() as object) }, meta: {} })
      ),
      http.post(`${BASE}/onboarding/complete`, () =>
        HttpResponse.json({ data: { onboardingCompleted: true, onboardingStep: 4 }, meta: {} })
      ),
      http.get(`${BASE}/programs/prog_1/tracking/status`, () =>
        HttpResponse.json({ data: { programId: 'prog_1', health: { scriptInstalled: { complete: true } } }, meta: {} })
      ),
      http.get(`${BASE}/invites/invite_token`, () =>
        HttpResponse.json({ data: { token: 'invite_token', programId: 'prog_1' }, meta: {} })
      ),
      http.post(`${BASE}/invites/invite_token/claim`, () =>
        HttpResponse.json({ data: { affiliateId: 'aff_1', programId: 'prog_1' }, meta: {} }, { status: 201 })
      ),
      http.get(`${BASE}/marketplace/programs`, () =>
        HttpResponse.json({
          data: [{ programId: 'prog_1', commissionPercent: 30 }],
          meta: { total: 1, page: 1, pageSize: 20, hasMore: false, requestId: 'r' },
        })
      ),
      http.post(`${BASE}/marketplace/apply/prog_1`, async ({ request }) =>
        HttpResponse.json({ data: { programId: 'prog_1', ...(await request.json() as object) }, meta: {} }, { status: 201 })
      ),
      http.get(`${BASE}/merchant/notifications`, () =>
        HttpResponse.json({ data: { newAffiliate: true, weeklyDigest: false }, meta: {} })
      ),
      http.get(`${BASE}/me/payout-info`, () =>
        HttpResponse.json({ data: { payoutMethod: 'paypal', paypalEmail: 'pay@example.com' }, meta: {} })
      )
    )

    const merchant = await client.onboarding.upsertMerchantProfile({ companyName: 'AgentRef' })
    const completed = await client.onboarding.complete()
    const tracking = await client.tracking.getProgramStatus('prog_1')
    const invite = await client.invites.get('invite_token')
    const claimed = await client.invites.claim('invite_token')
    const programs = await client.marketplace.listPrograms({ sort: 'commission' })
    const application = await client.marketplace.apply('prog_1', { message: 'I build AI agents.' })
    const notifications = await client.notifications.get()
    const payoutInfo = await client.payoutInfo.get()

    expect(merchant.companyName).toBe('AgentRef')
    expect(completed.onboardingCompleted).toBe(true)
    expect(tracking.programId).toBe('prog_1')
    expect(invite.token).toBe('invite_token')
    expect(claimed.affiliateId).toBe('aff_1')
    expect(programs.data[0]?.programId).toBe('prog_1')
    expect(application.message).toBe('I build AI agents.')
    expect(notifications.newAffiliate).toBe(true)
    expect(payoutInfo.paypalEmail).toBe('pay@example.com')
  })
})
