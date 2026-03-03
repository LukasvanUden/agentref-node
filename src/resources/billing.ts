import type { HttpClient } from '../http.js'
import type { BillingStatus, BillingTier, MutationOptions } from '../types/index.js'

export class BillingResource {
  constructor(private readonly http: HttpClient) {}

  async current(): Promise<BillingStatus> {
    const envelope = await this.http.request<{ data: BillingStatus; meta: unknown }>({
      method: 'GET',
      path: '/billing',
    })
    return envelope.data
  }

  async tiers(): Promise<BillingTier[]> {
    const envelope = await this.http.request<{ data: BillingTier[]; meta: unknown }>({
      method: 'GET',
      path: '/billing/tiers',
    })
    return envelope.data
  }

  async subscribe(data: { tier: 'starter' | 'growth' | 'pro' | 'scale' }, options?: MutationOptions): Promise<BillingStatus> {
    const envelope = await this.http.request<{ data: BillingStatus; meta: unknown }>({
      method: 'POST',
      path: '/billing/subscribe',
      body: data,
      idempotencyKey: options?.idempotencyKey,
    })
    return envelope.data
  }
}
