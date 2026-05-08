import type { HttpClient } from '../http.js'
import type {
  ApplyToMarketplaceProgramParams,
  MarketplaceProgram,
  PaginatedResponse,
} from '../types/index.js'

export class MarketplaceResource {
  constructor(private readonly http: HttpClient) {}

  listPrograms(params?: {
    category?: string
    minCommission?: number
    minEpc?: number
    sort?: 'epc' | 'conversionRate' | 'commission' | 'newest'
    cursor?: string
    limit?: number
    page?: number
    pageSize?: number
    offset?: number
  }): Promise<PaginatedResponse<MarketplaceProgram>> {
    return this.http.request({ method: 'GET', path: '/marketplace/programs', query: params })
  }

  async apply(programId: string, data?: ApplyToMarketplaceProgramParams): Promise<Record<string, unknown>> {
    const envelope = await this.http.request<{ data: Record<string, unknown>; meta: unknown }>({
      method: 'POST',
      path: `/marketplace/apply/${programId}`,
      body: data,
    })
    return envelope.data
  }
}
