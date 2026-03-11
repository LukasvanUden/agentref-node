import type { HttpClient } from '../http.js'
import type {
  Merchant,
  NotificationPreferences,
  PayoutInfo,
  UpdateMerchantParams,
  UpdateNotificationPreferencesParams,
  UpdatePayoutInfoParams,
} from '../types/index.js'

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

  async getPayoutInfo(): Promise<PayoutInfo> {
    const envelope = await this.http.request<{ data: PayoutInfo; meta: unknown }>({
      method: 'GET',
      path: '/me/payout-info',
    })
    return envelope.data
  }

  async updatePayoutInfo(data: UpdatePayoutInfoParams): Promise<PayoutInfo> {
    const envelope = await this.http.request<{ data: PayoutInfo; meta: unknown }>({
      method: 'PATCH',
      path: '/me/payout-info',
      body: data,
    })
    return envelope.data
  }

  async getNotifications(): Promise<NotificationPreferences> {
    const envelope = await this.http.request<{ data: NotificationPreferences; meta: unknown }>({
      method: 'GET',
      path: '/merchant/notifications',
    })
    return envelope.data
  }

  async updateNotifications(data: UpdateNotificationPreferencesParams): Promise<NotificationPreferences> {
    const envelope = await this.http.request<{ data: NotificationPreferences; meta: unknown }>({
      method: 'PUT',
      path: '/merchant/notifications',
      body: data,
    })
    return envelope.data
  }
}
