import type { HttpClient } from '../http.js'
import type { Merchant } from '../types/index.js'

export interface DomainStatus {
  domain: string | null
  verified: boolean
  txtRecord?: string | null
  [key: string]: unknown
}

export class MerchantResource {
  constructor(private readonly http: HttpClient) {}

  async get(): Promise<Merchant> {
    const envelope = await this.http.request<{ data: Merchant; meta: unknown }>({
      method: 'GET',
      path: '/merchant',
    })
    return envelope.data
  }

  async domainStatus(): Promise<DomainStatus> {
    const envelope = await this.http.request<{ data: DomainStatus; meta: unknown }>({
      method: 'GET',
      path: '/merchant/domain-status',
    })
    return envelope.data
  }
}
