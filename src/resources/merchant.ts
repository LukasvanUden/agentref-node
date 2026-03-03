import type { HttpClient } from '../http.js'
import type { Merchant, MerchantDomainStatus, StripeConnectSession, UpdateMerchantParams } from '../types/index.js'

export class MerchantResource {
  constructor(private readonly http: HttpClient) {}

  async get(): Promise<Merchant> {
    const envelope = await this.http.request<{ data: Merchant; meta: unknown }>({
      method: 'GET',
      path: '/merchant',
    })
    return envelope.data
  }

  async update(data: UpdateMerchantParams): Promise<Merchant> {
    const envelope = await this.http.request<{ data: Merchant; meta: unknown }>({
      method: 'PATCH',
      path: '/merchant',
      body: data,
    })
    return envelope.data
  }

  async connectStripe(): Promise<StripeConnectSession> {
    const envelope = await this.http.request<{ data: StripeConnectSession; meta: unknown }>({
      method: 'POST',
      path: '/merchant/connect-stripe',
    })
    return envelope.data
  }

  async domainStatus(): Promise<MerchantDomainStatus> {
    const envelope = await this.http.request<{ data: MerchantDomainStatus; meta: unknown }>({
      method: 'GET',
      path: '/merchant/domain-status',
    })
    return envelope.data
  }
}
