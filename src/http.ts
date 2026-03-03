import {
  AgentRefError,
  AuthError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  RateLimitError,
  ServerError,
  ValidationError,
} from './errors.js'
import type { AgentRefConfig } from './types/index.js'

export type HttpMethod = 'GET' | 'HEAD' | 'POST' | 'PATCH' | 'DELETE'

const SAFE_METHODS: ReadonlySet<HttpMethod> = new Set(['GET', 'HEAD'])

export interface RequestOptions {
  method: HttpMethod
  path: string
  body?: unknown
  query?: Record<string, string | number | boolean | undefined>
  idempotencyKey?: string
}

const DEFAULT_BASE_URL = 'https://www.agentref.dev/api/v1'
const DEFAULT_TIMEOUT = 30_000
const DEFAULT_MAX_RETRIES = 2

declare const __SDK_VERSION__: string
const VERSION = typeof __SDK_VERSION__ === 'string' ? __SDK_VERSION__ : '0.0.0'

function hasUsableIdempotencyKey(idempotencyKey: string | undefined): boolean {
  return typeof idempotencyKey === 'string' && idempotencyKey.trim().length > 0
}

export class HttpClient {
  private readonly apiKey: string
  private readonly baseUrl: string
  private readonly timeout: number
  private readonly maxRetries: number

  constructor(config: AgentRefConfig = {}) {
    if (typeof window !== 'undefined' && !config.dangerouslyAllowBrowser) {
      throw new Error(
        '[AgentRef] Refusing to initialize in browser context. API keys must not be exposed client-side. Use a server-side proxy to call the AgentRef API instead. To override: set dangerouslyAllowBrowser: true (understand the security implications first).'
      )
    }

    const apiKey = config.apiKey ?? process.env['AGENTREF_API_KEY']
    if (!apiKey) {
      throw new Error(
        '[AgentRef] API key is required. Pass it as apiKey or set the AGENTREF_API_KEY environment variable.'
      )
    }

    this.apiKey = apiKey
    this.baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, '')
    this.timeout = config.timeout ?? DEFAULT_TIMEOUT
    this.maxRetries = config.maxRetries ?? DEFAULT_MAX_RETRIES
  }

  async request<T>(options: RequestOptions): Promise<T> {
    const url = this.buildUrl(options.path, options.query)
    const isSafe = SAFE_METHODS.has(options.method)
    const hasIdempotency = options.method === 'POST' && hasUsableIdempotencyKey(options.idempotencyKey)
    const canRetry = isSafe || hasIdempotency
    const maxAttempts = canRetry ? this.maxRetries + 1 : 1

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      let response: Response

      try {
        const headers: Record<string, string> = {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': `agentref-node/${VERSION}`,
        }

        if (hasIdempotency) {
          headers['Idempotency-Key'] = options.idempotencyKey!.trim()
        }

        response = await fetch(url, {
          method: options.method,
          headers,
          body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
          signal: AbortSignal.timeout(this.timeout),
        })
      } catch (error) {
        if (canRetry && attempt < maxAttempts - 1) {
          await this.wait(this.backoff(attempt))
          continue
        }
        throw error
      }

      if (!response.ok) {
        const parsedError = await this.parseError(response)

        if (canRetry && this.isRetryable(response.status) && attempt < maxAttempts - 1) {
          const delay =
            response.status === 429
              ? this.retryAfterToMs(response.headers.get('Retry-After'))
              : this.backoff(attempt)
          await this.wait(delay)
          continue
        }

        throw parsedError
      }

      return response.json() as Promise<T>
    }

    throw new ServerError('Request failed after retries', 'REQUEST_RETRY_EXHAUSTED', 500, '')
  }

  private buildUrl(path: string, query?: Record<string, string | number | boolean | undefined>): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    const url = new URL(`${this.baseUrl}${normalizedPath}`)

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value))
        }
      }
    }

    return url.toString()
  }

  private async parseError(response: Response): Promise<AgentRefError> {
    const json = (await response.json().catch(() => ({}))) as {
      error?: { code?: string; message?: string; details?: unknown }
      meta?: { requestId?: string }
    }

    const code = json.error?.code ?? 'UNKNOWN_ERROR'
    const message = json.error?.message ?? response.statusText
    const requestId = json.meta?.requestId ?? ''
    const details = json.error?.details

    if (response.status === 400) return new ValidationError(message, code, requestId, details)
    if (response.status === 401) return new AuthError(message, code, requestId)
    if (response.status === 403) return new ForbiddenError(message, code, requestId)
    if (response.status === 404) return new NotFoundError(message, code, requestId)
    if (response.status === 409) return new ConflictError(message, code, requestId)
    if (response.status === 429) {
      return new RateLimitError(message, code, requestId, this.retryAfterToSeconds(response.headers.get('Retry-After')))
    }

    return new ServerError(message, code, response.status, requestId)
  }

  private isRetryable(status: number): boolean {
    return status === 429 || status >= 500
  }

  private retryAfterToSeconds(headerValue: string | null): number {
    if (!headerValue) return 60

    const numericSeconds = Number(headerValue)
    if (!Number.isNaN(numericSeconds) && numericSeconds >= 0) {
      return Math.ceil(numericSeconds)
    }

    const asDate = Date.parse(headerValue)
    if (!Number.isNaN(asDate)) {
      const deltaMs = asDate - Date.now()
      return Math.max(0, Math.ceil(deltaMs / 1000))
    }

    return 60
  }

  private retryAfterToMs(headerValue: string | null): number {
    return this.retryAfterToSeconds(headerValue) * 1000
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
  }

  private backoff(attempt: number): number {
    return 500 * Math.pow(2, attempt)
  }
}
