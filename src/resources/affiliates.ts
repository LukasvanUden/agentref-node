import type { HttpClient } from '../http.js'
import type { Affiliate, AffiliateSortBy, AffiliateStatus, MutationOptions, PaginatedResponse, SortOrder } from '../types/index.js'

export class AffiliatesResource {
  constructor(private readonly http: HttpClient) {}

  list(params?: {
    programId?: string
    includeBlocked?: boolean
    search?: string
    sortBy?: AffiliateSortBy
    sortOrder?: SortOrder
    status?: AffiliateStatus
    cursor?: string
    limit?: number
    page?: number
    pageSize?: number
    offset?: number
  }): Promise<PaginatedResponse<Affiliate>> {
    return this.http.request({ method: 'GET', path: '/affiliates', query: params })
  }

  async get(id: string, options?: { include?: 'stats' }): Promise<Affiliate> {
    const envelope = await this.http.request<{ data: Affiliate; meta: unknown }>({
      method: 'GET',
      path: `/affiliates/${id}`,
      query: options?.include ? { include: options.include } : undefined,
    })
    return envelope.data
  }

  async approve(id: string, options?: MutationOptions): Promise<Affiliate> {
    const envelope = await this.http.request<{ data: Affiliate; meta: unknown }>({
      method: 'POST',
      path: `/affiliates/${id}/approve`,
      idempotencyKey: options?.idempotencyKey,
    })
    return envelope.data
  }

  async block(id: string, data?: { reason?: string }, options?: MutationOptions): Promise<Affiliate> {
    const envelope = await this.http.request<{ data: Affiliate; meta: unknown }>({
      method: 'POST',
      path: `/affiliates/${id}/block`,
      body: data,
      idempotencyKey: options?.idempotencyKey,
    })
    return envelope.data
  }

  async unblock(id: string, options?: MutationOptions): Promise<Affiliate> {
    const envelope = await this.http.request<{ data: Affiliate; meta: unknown }>({
      method: 'POST',
      path: `/affiliates/${id}/unblock`,
      idempotencyKey: options?.idempotencyKey,
    })
    return envelope.data
  }
}
