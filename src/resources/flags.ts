import type { HttpClient } from '../http.js'
import type { Flag, FlagStats, MutationOptions, PaginatedResponse, ResolveFlagParams } from '../types/index.js'

export class FlagsResource {
  constructor(private readonly http: HttpClient) {}

  list(params?: {
    status?: string
    type?: string
    affiliateId?: string
    cursor?: string
    limit?: number
    page?: number
    pageSize?: number
    offset?: number
  }): Promise<PaginatedResponse<Flag>> {
    return this.http.request({ method: 'GET', path: '/flags', query: params })
  }

  async stats(): Promise<FlagStats> {
    const envelope = await this.http.request<{ data: FlagStats; meta: unknown }>({
      method: 'GET',
      path: '/flags/stats',
    })
    return envelope.data
  }

  async resolve(id: string, data: ResolveFlagParams, options?: MutationOptions): Promise<Flag> {
    const envelope = await this.http.request<{ data: Flag; meta: unknown }>({
      method: 'POST',
      path: `/flags/${id}/resolve`,
      body: data,
      idempotencyKey: options?.idempotencyKey,
    })
    return envelope.data
  }
}
