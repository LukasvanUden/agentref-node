import type { HttpClient } from '../http.js'
import type { PayoutInfo, UpdatePayoutInfoParams } from '../types/index.js'

export class PayoutInfoResource {
  constructor(private readonly http: HttpClient) {}

  async get(): Promise<PayoutInfo> {
    const envelope = await this.http.request<{ data: PayoutInfo; meta: unknown }>({
      method: 'GET',
      path: '/me/payout-info',
    })
    return envelope.data
  }

  async update(data: UpdatePayoutInfoParams): Promise<PayoutInfo> {
    const envelope = await this.http.request<{ data: PayoutInfo; meta: unknown }>({
      method: 'PATCH',
      path: '/me/payout-info',
      body: data,
    })
    return envelope.data
  }
}
