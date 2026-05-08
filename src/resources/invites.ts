import type { HttpClient } from '../http.js'
import type { Invite } from '../types/index.js'

export class InvitesResource {
  constructor(private readonly http: HttpClient) {}

  async get(token: string): Promise<Invite> {
    const envelope = await this.http.request<{ data: Invite; meta: unknown }>({
      method: 'GET',
      path: `/invites/${token}`,
    })
    return envelope.data
  }

  async claim(token: string): Promise<Record<string, unknown>> {
    const envelope = await this.http.request<{ data: Record<string, unknown>; meta: unknown }>({
      method: 'POST',
      path: `/invites/${token}/claim`,
    })
    return envelope.data
  }
}
