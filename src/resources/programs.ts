import type { HttpClient } from '../http.js'
import type {
  Affiliate,
  Coupon,
  CreateCouponParams,
  CreateProgramParams,
  Invite,
  MutationOptions,
  PaginatedResponse,
  Program,
  ProgramStats,
  UpdateProgramParams,
} from '../types/index.js'

export class ProgramsResource {
  constructor(private readonly http: HttpClient) {}

  list(params?: {
    cursor?: string
    limit?: number
    page?: number
    pageSize?: number
    offset?: number
  }): Promise<PaginatedResponse<Program>> {
    return this.http.request({ method: 'GET', path: '/programs', query: params })
  }

  async *listAll(params?: {
    pageSize?: number
  }): AsyncGenerator<Program> {
    let page = 1
    const pageSize = params?.pageSize ?? 100

    while (true) {
      const response = await this.list({ page, limit: pageSize })
      yield* response.data

      if (!response.meta.hasMore) {
        break
      }

      page += 1
    }
  }

  async get(id: string): Promise<Program> {
    const envelope = await this.http.request<{ data: Program; meta: unknown }>({
      method: 'GET',
      path: `/programs/${id}`,
    })
    return envelope.data
  }

  async create(data: CreateProgramParams, options?: MutationOptions): Promise<Program> {
    const envelope = await this.http.request<{ data: Program; meta: unknown }>({
      method: 'POST',
      path: '/programs',
      body: data,
      idempotencyKey: options?.idempotencyKey,
    })
    return envelope.data
  }

  async update(id: string, data: UpdateProgramParams): Promise<Program> {
    const envelope = await this.http.request<{ data: Program; meta: unknown }>({
      method: 'PATCH',
      path: `/programs/${id}`,
      body: data,
    })
    return envelope.data
  }

  async delete(id: string): Promise<Program> {
    const envelope = await this.http.request<{ data: Program; meta: unknown }>({
      method: 'DELETE',
      path: `/programs/${id}`,
    })
    return envelope.data
  }

  async stats(id: string, params?: { period?: string }): Promise<ProgramStats> {
    const envelope = await this.http.request<{ data: ProgramStats; meta: unknown }>({
      method: 'GET',
      path: `/programs/${id}/stats`,
      query: params,
    })
    return envelope.data
  }

  listAffiliates(
    id: string,
    params?: { includeBlocked?: boolean; cursor?: string; limit?: number; page?: number; pageSize?: number; offset?: number }
  ): Promise<PaginatedResponse<Affiliate>> {
    return this.http.request({
      method: 'GET',
      path: `/programs/${id}/affiliates`,
      query: params,
    })
  }

  async listCoupons(id: string): Promise<Coupon[]> {
    const envelope = await this.http.request<{ data: Coupon[]; meta: unknown }>({
      method: 'GET',
      path: `/programs/${id}/coupons`,
    })
    return envelope.data
  }

  async createCoupon(id: string, data: CreateCouponParams, options?: MutationOptions): Promise<Coupon> {
    const envelope = await this.http.request<{ data: Coupon; meta: unknown }>({
      method: 'POST',
      path: `/programs/${id}/coupons`,
      body: data,
      idempotencyKey: options?.idempotencyKey,
    })
    return envelope.data
  }

  async createInvite(
    id: string,
    data: {
      email?: string
      name?: string
      isPublic?: boolean
      usageLimit?: number
      expiresInDays?: number
    },
    options?: MutationOptions
  ): Promise<Invite> {
    const envelope = await this.http.request<{ data: Invite; meta: unknown }>({
      method: 'POST',
      path: `/programs/${id}/invites`,
      body: data,
      idempotencyKey: options?.idempotencyKey,
    })
    return envelope.data
  }
}
