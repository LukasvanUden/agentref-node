import type { HttpClient } from '../http.js'
import type {
  AffiliateLink,
  AffiliateProgramQuery,
  AffiliateWorkspaceIdentity,
  AffiliateWorkspaceOverview,
  AffiliateWorkspaceProgram,
  AffiliateWorkspaceProgramDetail,
  ApiObject,
  CreateAffiliateLinkParams,
  MutationOptions,
  PaginatedResponse,
  Payout,
  UpdateAffiliateLinkParams,
} from '../types/index.js'

export class AffiliateWorkspaceResource {
  constructor(private readonly http: HttpClient) {}

  async overview(): Promise<AffiliateWorkspaceOverview> {
    const envelope = await this.http.request<{ data: AffiliateWorkspaceOverview; meta: unknown }>({
      method: 'GET',
      path: '/me/overview',
    })

    return envelope.data
  }

  async identity(): Promise<AffiliateWorkspaceIdentity> {
    const envelope = await this.http.request<{ data: AffiliateWorkspaceIdentity; meta: unknown }>({
      method: 'GET',
      path: '/me',
    })

    return envelope.data
  }

  async listPrograms(): Promise<AffiliateWorkspaceProgram[]> {
    const envelope = await this.http.request<{ data: AffiliateWorkspaceProgram[]; meta: unknown }>({
      method: 'GET',
      path: '/me/programs',
    })

    return envelope.data
  }

  async getProgram(programId: string): Promise<AffiliateWorkspaceProgramDetail> {
    const envelope = await this.http.request<{ data: AffiliateWorkspaceProgramDetail; meta: unknown }>({
      method: 'GET',
      path: `/me/programs/${programId}`,
    })

    return envelope.data
  }

  async earnings(): Promise<ApiObject> {
    const envelope = await this.http.request<{ data: ApiObject; meta: unknown }>({
      method: 'GET',
      path: '/me/earnings',
    })

    return envelope.data
  }

  listProgramEarnings(
    programId: string,
    params?: { period?: '7d' | '30d' | '90d' | 'all'; cursor?: string; limit?: number; page?: number; pageSize?: number; offset?: number }
  ): Promise<PaginatedResponse<ApiObject>> {
    return this.http.request({
      method: 'GET',
      path: `/me/earnings/${programId}`,
      query: params,
    })
  }

  listPayouts(params?: AffiliateProgramQuery & {
    cursor?: string
    limit?: number
    page?: number
    pageSize?: number
    offset?: number
  }): Promise<PaginatedResponse<Payout>> {
    return this.http.request({
      method: 'GET',
      path: '/me/payouts',
      query: {
        program_id: params?.programId,
        cursor: params?.cursor,
        limit: params?.limit,
        page: params?.page,
        pageSize: params?.pageSize,
        offset: params?.offset,
      },
    })
  }

  async listLinks(params?: AffiliateProgramQuery): Promise<AffiliateLink[]> {
    const envelope = await this.http.request<{ data: AffiliateLink[]; meta: unknown }>({
      method: 'GET',
      path: '/me/links',
      query: { program_id: params?.programId },
    })

    return envelope.data
  }

  async createLink(
    data: CreateAffiliateLinkParams,
    options?: MutationOptions & AffiliateProgramQuery
  ): Promise<AffiliateLink> {
    const envelope = await this.http.request<{ data: AffiliateLink; meta: unknown }>({
      method: 'POST',
      path: '/me/links',
      query: { program_id: options?.programId },
      body: {
        name: data.name,
        destination_path: data.destinationPath,
        custom_slug: data.customSlug,
      },
      idempotencyKey: options?.idempotencyKey,
    })

    return envelope.data
  }

  async updateLink(
    id: string,
    data: UpdateAffiliateLinkParams,
    options?: AffiliateProgramQuery
  ): Promise<AffiliateLink> {
    const envelope = await this.http.request<{ data: AffiliateLink; meta: unknown }>({
      method: 'PATCH',
      path: `/me/links/${id}`,
      query: { program_id: options?.programId },
      body: data,
    })

    return envelope.data
  }

  async deleteLink(id: string, options?: AffiliateProgramQuery): Promise<ApiObject> {
    const envelope = await this.http.request<{ data: ApiObject; meta: unknown }>({
      method: 'DELETE',
      path: `/me/links/${id}`,
      query: { program_id: options?.programId },
    })

    return envelope.data
  }

  async clickStats(params?: AffiliateProgramQuery & { startDate?: string; endDate?: string }): Promise<ApiObject> {
    const envelope = await this.http.request<{ data: ApiObject; meta: unknown }>({
      method: 'GET',
      path: '/me/clicks',
      query: {
        program_id: params?.programId,
        startDate: params?.startDate,
        endDate: params?.endDate,
      },
    })

    return envelope.data
  }
}
