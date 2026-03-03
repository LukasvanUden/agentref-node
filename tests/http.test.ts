import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { HttpClient } from '../src/http.js'
import {
  AuthError,
  ForbiddenError,
  NotFoundError,
  RateLimitError,
  ServerError,
} from '../src/errors.js'

const BASE = 'https://www.agentref.dev/api/v1'
const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('initialization', () => {
  it('throws if no apiKey provided and no env var', () => {
    const saved = process.env.AGENTREF_API_KEY
    delete process.env.AGENTREF_API_KEY
    expect(() => new HttpClient()).toThrow('API key is required')
    if (saved) process.env.AGENTREF_API_KEY = saved
  })

  it('reads API key from env var', () => {
    process.env.AGENTREF_API_KEY = 'ak_live_test'
    expect(() => new HttpClient()).not.toThrow()
    delete process.env.AGENTREF_API_KEY
  })
})

describe('browser guard', () => {
  it('throws by default in browser context', () => {
    const g = global as unknown as Record<string, unknown>
    g.window = {}
    expect(() => new HttpClient({ apiKey: 'ak_live_test' })).toThrow('Refusing to initialize in browser context')
    delete g.window
  })

  it('allows browser context with dangerous flag', () => {
    const g = global as unknown as Record<string, unknown>
    g.window = {}
    expect(() => new HttpClient({ apiKey: 'ak_live_test', dangerouslyAllowBrowser: true })).not.toThrow()
    delete g.window
  })
})

describe('request basics', () => {
  it('sends Authorization header', async () => {
    let capturedAuth = ''
    server.use(
      http.get(`${BASE}/programs`, ({ request }) => {
        capturedAuth = request.headers.get('authorization') ?? ''
        return HttpResponse.json({
          data: [],
          meta: { total: 0, page: 1, pageSize: 20, hasMore: false, requestId: 'req_1' },
        })
      })
    )

    const client = new HttpClient({ apiKey: 'ak_live_abc123' })
    await client.request({ method: 'GET', path: '/programs' })
    expect(capturedAuth).toBe('Bearer ak_live_abc123')
  })

  it('returns full envelope', async () => {
    const envelope = {
      data: [{ id: '1' }],
      meta: { total: 1, page: 1, pageSize: 20, hasMore: false, requestId: 'req_2' },
    }
    server.use(http.get(`${BASE}/programs`, () => HttpResponse.json(envelope)))

    const client = new HttpClient({ apiKey: 'ak_live_test' })
    const result = await client.request<typeof envelope>({ method: 'GET', path: '/programs' })
    expect(result).toEqual(envelope)
    expect(result.meta.requestId).toBe('req_2')
  })

  it('omits undefined query params', async () => {
    let capturedUrl = ''
    server.use(
      http.get(`${BASE}/programs`, ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({
          data: [],
          meta: { total: 0, page: 1, pageSize: 10, hasMore: false, requestId: 'req_3' },
        })
      })
    )

    const client = new HttpClient({ apiKey: 'ak_live_test' })
    await client.request({ method: 'GET', path: '/programs', query: { limit: 10, offset: undefined } })
    expect(capturedUrl).toContain('limit=10')
    expect(capturedUrl).not.toContain('offset=')
  })

  it('sends Idempotency-Key only for POST', async () => {
    let postKey = ''
    let patchKey = ''

    server.use(
      http.post(`${BASE}/programs`, ({ request }) => {
        postKey = request.headers.get('idempotency-key') ?? ''
        return HttpResponse.json({ data: { id: 'prog_1' }, meta: { requestId: 'req_4' } }, { status: 201 })
      }),
      http.patch(`${BASE}/programs/prog_1`, ({ request }) => {
        patchKey = request.headers.get('idempotency-key') ?? ''
        return HttpResponse.json({ data: { id: 'prog_1' }, meta: { requestId: 'req_5' } }, { status: 200 })
      })
    )

    const client = new HttpClient({ apiKey: 'ak_live_test' })
    await client.request({ method: 'POST', path: '/programs', body: {}, idempotencyKey: 'idem-1' })
    await client.request({ method: 'PATCH', path: '/programs/prog_1', body: {}, idempotencyKey: 'idem-2' })

    expect(postKey).toBe('idem-1')
    expect(patchKey).toBe('')
  })
})

describe('error parsing', () => {
  it('maps 401 to AuthError', async () => {
    server.use(
      http.get(`${BASE}/me`, () =>
        HttpResponse.json(
          { error: { code: 'INVALID_AUTH', message: 'Unauthorized' }, meta: { requestId: 'req_e1' } },
          { status: 401 }
        )
      )
    )

    const client = new HttpClient({ apiKey: 'ak_live_test', maxRetries: 0 })
    await expect(client.request({ method: 'GET', path: '/me' })).rejects.toBeInstanceOf(AuthError)
  })

  it('maps 403 to ForbiddenError', async () => {
    server.use(
      http.get(`${BASE}/programs`, () =>
        HttpResponse.json(
          { error: { code: 'FORBIDDEN', message: 'Merchant key required' }, meta: { requestId: 'req_e2' } },
          { status: 403 }
        )
      )
    )

    const client = new HttpClient({ apiKey: 'ak_live_test', maxRetries: 0 })
    const error = await client.request({ method: 'GET', path: '/programs' }).catch((e) => e)

    expect(error).toBeInstanceOf(ForbiddenError)
    expect(error).not.toBeInstanceOf(ServerError)
  })

  it('maps 404 to NotFoundError', async () => {
    server.use(
      http.get(`${BASE}/programs/missing`, () =>
        HttpResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Not found' }, meta: { requestId: 'req_e3' } },
          { status: 404 }
        )
      )
    )

    const client = new HttpClient({ apiKey: 'ak_live_test', maxRetries: 0 })
    await expect(client.request({ method: 'GET', path: '/programs/missing' })).rejects.toBeInstanceOf(NotFoundError)
  })

  it('maps 429 to RateLimitError', async () => {
    server.use(
      http.get(`${BASE}/programs`, () =>
        HttpResponse.json(
          { error: { code: 'RATE_LIMITED', message: 'Too many requests' }, meta: { requestId: 'req_e4' } },
          { status: 429, headers: { 'Retry-After': '30' } }
        )
      )
    )

    const client = new HttpClient({ apiKey: 'ak_live_test', maxRetries: 0 })
    const error = await client.request({ method: 'GET', path: '/programs' }).catch((e) => e)

    expect(error).toBeInstanceOf(RateLimitError)
    expect(error.retryAfter).toBe(30)
  })
})

describe('retry behavior', () => {
  it('retries GET on 500', async () => {
    let callCount = 0

    server.use(
      http.get(`${BASE}/programs`, () => {
        callCount += 1
        if (callCount < 3) {
          return HttpResponse.json(
            { error: { code: 'INTERNAL_ERROR' }, meta: { requestId: 'r' } },
            { status: 500 }
          )
        }

        return HttpResponse.json({
          data: [],
          meta: { total: 0, page: 1, pageSize: 20, hasMore: false, requestId: 'r' },
        })
      })
    )

    const client = new HttpClient({ apiKey: 'ak_live_test', maxRetries: 2 })
    await client.request({ method: 'GET', path: '/programs' })
    expect(callCount).toBe(3)
  })

  it('does not retry POST without idempotencyKey', async () => {
    let callCount = 0

    server.use(
      http.post(`${BASE}/programs`, () => {
        callCount += 1
        return HttpResponse.json(
          { error: { code: 'INTERNAL_ERROR' }, meta: { requestId: 'r' } },
          { status: 500 }
        )
      })
    )

    const client = new HttpClient({ apiKey: 'ak_live_test', maxRetries: 2 })
    await client.request({ method: 'POST', path: '/programs', body: {} }).catch(() => undefined)
    expect(callCount).toBe(1)
  })

  it('retries POST with idempotencyKey', async () => {
    let callCount = 0

    server.use(
      http.post(`${BASE}/programs`, () => {
        callCount += 1
        if (callCount < 3) {
          return HttpResponse.json(
            { error: { code: 'INTERNAL_ERROR' }, meta: { requestId: 'r' } },
            { status: 500 }
          )
        }

        return HttpResponse.json({ data: { id: 'prog_1' }, meta: { requestId: 'r' } }, { status: 201 })
      })
    )

    const client = new HttpClient({ apiKey: 'ak_live_test', maxRetries: 2 })
    await client.request({ method: 'POST', path: '/programs', body: {}, idempotencyKey: 'key-abc' })
    expect(callCount).toBe(3)
  })

  it('never retries PATCH', async () => {
    let callCount = 0

    server.use(
      http.patch(`${BASE}/programs/prog_1`, () => {
        callCount += 1
        return HttpResponse.json(
          { error: { code: 'INTERNAL_ERROR' }, meta: { requestId: 'r' } },
          { status: 500 }
        )
      })
    )

    const client = new HttpClient({ apiKey: 'ak_live_test', maxRetries: 2 })
    await client
      .request({ method: 'PATCH', path: '/programs/prog_1', body: { name: 'x' }, idempotencyKey: 'ignored' })
      .catch(() => undefined)

    expect(callCount).toBe(1)
  })

  it('never retries DELETE', async () => {
    let callCount = 0

    server.use(
      http.delete(`${BASE}/programs/prog_1`, () => {
        callCount += 1
        return HttpResponse.json(
          { error: { code: 'INTERNAL_ERROR' }, meta: { requestId: 'r' } },
          { status: 500 }
        )
      })
    )

    const client = new HttpClient({ apiKey: 'ak_live_test', maxRetries: 2 })
    await client.request({ method: 'DELETE', path: '/programs/prog_1' }).catch(() => undefined)
    expect(callCount).toBe(1)
  })
})
