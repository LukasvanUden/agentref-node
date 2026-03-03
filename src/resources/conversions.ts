import type { HttpClient } from '../http.js'
import type { Conversion, ConversionStats, PaginatedResponse } from '../types/index.js'

export class ConversionsResource {
  constructor(private readonly http: HttpClient) {}

  list(params?: {
    programId?: string
    affiliateId?: string
    status?: string
    startDate?: string
    endDate?: string
    from?: string
    to?: string
    cursor?: string
    limit?: number
    page?: number
    pageSize?: number
    offset?: number
  }): Promise<PaginatedResponse<Conversion>> {
    return this.http.request({ method: 'GET', path: '/conversions', query: params })
  }

  async stats(params?: { programId?: string; period?: '7d' | '30d' | '90d' | 'all' }): Promise<ConversionStats> {
    const envelope = await this.http.request<{ data: ConversionStats; meta: unknown }>({
      method: 'GET',
      path: '/conversions/stats',
      query: params,
    })
    return envelope.data
  }

  async recent(params?: { limit?: number }): Promise<Conversion[]> {
    const envelope = await this.http.request<{ data: Conversion[]; meta: unknown }>({
      method: 'GET',
      path: '/conversions/recent',
      query: params,
    })
    return envelope.data
  }
}
