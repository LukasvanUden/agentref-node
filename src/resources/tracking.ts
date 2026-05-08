import type { HttpClient } from '../http.js'
import type { ProgramTrackingStatus } from '../types/index.js'

export class TrackingResource {
  constructor(private readonly http: HttpClient) {}

  async getProgramStatus(programId: string): Promise<ProgramTrackingStatus> {
    const envelope = await this.http.request<{ data: ProgramTrackingStatus; meta: unknown }>({
      method: 'GET',
      path: `/programs/${programId}/tracking/status`,
    })
    return envelope.data
  }
}
