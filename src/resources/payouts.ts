import type { HttpClient } from '../http.js'
import type { PaginatedResponse, PendingAffiliate, Payout, PayoutStats, PayoutStatus } from '../types/index.js'

export class PayoutsResource {
  constructor(private readonly http: HttpClient) {}

  list(params?: {
    programId?: string
    affiliateId?: string
    status?: PayoutStatus
    startDate?: string
    endDate?: string
    from?: string
    to?: string
    cursor?: string
    limit?: number
    page?: number
    pageSize?: number
    offset?: number
  }): Promise<PaginatedResponse<Payout>> {
    return this.http.request({ method: 'GET', path: '/payouts', query: params })
  }

  listPending(params?: {
    programId?: string
    cursor?: string
    limit?: number
    page?: number
    pageSize?: number
    offset?: number
  }): Promise<PaginatedResponse<PendingAffiliate>> {
    return this.http.request({ method: 'GET', path: '/payouts/pending', query: params })
  }

  async stats(params?: { programId?: string; period?: '7d' | '30d' | '90d' | 'all' }): Promise<PayoutStats> {
    const envelope = await this.http.request<{ data: PayoutStats; meta: unknown }>({
      method: 'GET',
      path: '/payouts/stats',
      query: params,
    })
    return envelope.data
  }
}
