import type { HttpClient } from '../http.js'
import type { NotificationPreferences, UpdateNotificationPreferencesParams } from '../types/index.js'

export class NotificationsResource {
  constructor(private readonly http: HttpClient) {}

  async get(): Promise<NotificationPreferences> {
    const envelope = await this.http.request<{ data: NotificationPreferences; meta: unknown }>({
      method: 'GET',
      path: '/merchant/notifications',
    })
    return envelope.data
  }

  async update(data: UpdateNotificationPreferencesParams): Promise<NotificationPreferences> {
    const envelope = await this.http.request<{ data: NotificationPreferences; meta: unknown }>({
      method: 'PUT',
      path: '/merchant/notifications',
      body: data,
    })
    return envelope.data
  }
}
