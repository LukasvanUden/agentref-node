import type { HttpClient } from '../http.js'
import type { CompleteOnboardingResponse, OnboardingMerchantProfile } from '../types/index.js'

export class OnboardingResource {
  constructor(private readonly http: HttpClient) {}

  async upsertMerchantProfile(data: { companyName: string }): Promise<OnboardingMerchantProfile> {
    const envelope = await this.http.request<{ data: OnboardingMerchantProfile; meta: unknown }>({
      method: 'POST',
      path: '/onboarding/merchant',
      body: data,
    })
    return envelope.data
  }

  async complete(): Promise<CompleteOnboardingResponse> {
    const envelope = await this.http.request<{ data: CompleteOnboardingResponse; meta: unknown }>({
      method: 'POST',
      path: '/onboarding/complete',
    })
    return envelope.data
  }
}
