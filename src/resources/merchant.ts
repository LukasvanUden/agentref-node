import type { HttpClient } from '../http.js'
import type {
  Merchant,
  UpdateMerchantParams,
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
}
