import type { HttpClient } from '../http.js'
import type {
  Application,
  ApplicationSource,
  ApplicationStatus,
  MutationOptions,
  PaginatedResponse,
  ReviewApplicationParams,
} from '../types/index.js'

export class ApplicationsResource {
  constructor(private readonly http: HttpClient) {}

  list(params?: {
    programId?: string
    search?: string
    status?: ApplicationStatus
    source?: ApplicationSource
    cursor?: string
    limit?: number
    page?: number
    pageSize?: number
    offset?: number
  }): Promise<PaginatedResponse<Application>> {
    return this.http.request({ method: 'GET', path: '/applications', query: params })
  }

  async get(id: string): Promise<Application> {
    const envelope = await this.http.request<{ data: Application; meta: unknown }>({
      method: 'GET',
      path: `/applications/${id}`,
    })
    return envelope.data
  }

  approve(id: string, data?: ReviewApplicationParams, options?: MutationOptions): Promise<Application> {
    return this.review(id, 'approve', data, options)
  }

  decline(id: string, data?: ReviewApplicationParams, options?: MutationOptions): Promise<Application> {
    return this.review(id, 'decline', data, options)
  }

  block(id: string, data?: ReviewApplicationParams, options?: MutationOptions): Promise<Application> {
    return this.review(id, 'block', data, options)
  }

  private async review(
    id: string,
    action: 'approve' | 'decline' | 'block',
    data?: ReviewApplicationParams,
    options?: MutationOptions
  ): Promise<Application> {
    const envelope = await this.http.request<{ data: Application; meta: unknown }>({
      method: 'POST',
      path: `/applications/${id}/${action}`,
      body: data,
      idempotencyKey: options?.idempotencyKey,
    })
    return envelope.data
  }
}
