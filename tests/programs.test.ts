import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { ProgramsResource } from '../src/resources/programs.js'
import { HttpClient } from '../src/http.js'

const BASE = 'https://www.agentref.dev/api/v1'
const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const makeResource = () => new ProgramsResource(new HttpClient({ apiKey: 'ak_live_test' }))

const mockProgram = {
  id: 'prog_1',
  name: 'Test Program',
  commissionType: 'one_time',
  commissionPercent: 20,
  commissionLimitMonths: null,
  cookieDuration: 30,
  payoutThreshold: 5000,
  autoApproveAffiliates: true,
  description: null,
  landingPageUrl: null,
  status: 'active',
  isPublic: true,
  merchantId: 'merch_1',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

const mockMeta = { total: 1, page: 1, pageSize: 20, hasMore: false, requestId: 'req_1' }

describe('programs.list contract', () => {
  it('returns paginated response', async () => {
    server.use(
      http.get(`${BASE}/programs`, () => HttpResponse.json({ data: [mockProgram], meta: mockMeta }))
    )

    const result = await makeResource().list()
    expect(result.meta.page).toBe(1)
    expect(result.meta.pageSize).toBe(20)
    expect(result.meta.hasMore).toBe(false)
    expect(result.meta.requestId).toBe('req_1')
  })
})

describe('programs.get envelope unwrap', () => {
  it('returns Program directly', async () => {
    server.use(
      http.get(`${BASE}/programs/prog_1`, () =>
        HttpResponse.json({ data: mockProgram, meta: { requestId: 'req_2' } })
      )
    )

    const result = await makeResource().get('prog_1')
    expect(result.id).toBe('prog_1')
    expect(result.commissionType).toBe('one_time')
    expect((result as Record<string, unknown>)['commissionRate']).toBeUndefined()
  })
})

describe('programs.create field names', () => {
  it('posts commissionType/commissionPercent/cookieDuration', async () => {
    let capturedBody: unknown

    server.use(
      http.post(`${BASE}/programs`, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json({ data: mockProgram, meta: { requestId: 'req_3' } }, { status: 201 })
      })
    )

    await makeResource().create({
      name: 'New Program',
      commissionType: 'one_time',
      commissionPercent: 15,
      cookieDuration: 45,
    })

    expect(capturedBody).toMatchObject({
      name: 'New Program',
      commissionType: 'one_time',
      commissionPercent: 15,
      cookieDuration: 45,
    })

    expect((capturedBody as Record<string, unknown>)['commissionRate']).toBeUndefined()
    expect((capturedBody as Record<string, unknown>)['cookieDays']).toBeUndefined()
  })
})

describe('programs.listAll hasMore stop condition', () => {
  it('fetches multiple pages and stops when hasMore is false', async () => {
    let callCount = 0

    server.use(
      http.get(`${BASE}/programs`, ({ request }) => {
        const page = Number(new URL(request.url).searchParams.get('page') ?? '1')
        callCount += 1

        if (page === 1) {
          return HttpResponse.json({
            data: [{ ...mockProgram, id: 'prog_p1' }],
            meta: { total: 2, page: 1, pageSize: 1, hasMore: true, requestId: 'r1' },
          })
        }

        return HttpResponse.json({
          data: [{ ...mockProgram, id: 'prog_p2' }],
          meta: { total: 2, page: 2, pageSize: 1, hasMore: false, requestId: 'r2' },
        })
      })
    )

    const programs: Array<{ id: string }> = []
    for await (const program of makeResource().listAll({ pageSize: 1 })) {
      programs.push(program as { id: string })
    }

    expect(callCount).toBe(2)
    expect(programs).toHaveLength(2)
    expect(programs[0]?.id).toBe('prog_p1')
    expect(programs[1]?.id).toBe('prog_p2')
  })
})

describe('programs.create idempotency', () => {
  it('forwards idempotency key header', async () => {
    let capturedKey = ''

    server.use(
      http.post(`${BASE}/programs`, ({ request }) => {
        capturedKey = request.headers.get('idempotency-key') ?? ''
        return HttpResponse.json({ data: mockProgram, meta: { requestId: 'r' } }, { status: 201 })
      })
    )

    await makeResource().create(
      { name: 'Test', commissionType: 'one_time', commissionPercent: 10 },
      { idempotencyKey: 'idem-key-xyz' }
    )

    expect(capturedKey).toBe('idem-key-xyz')
  })
})
