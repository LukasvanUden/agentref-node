import type { HttpClient } from '../http.js'
import type {
  CreateWebhookEndpointParams,
  SuccessResponse,
  UpdateWebhookEndpointParams,
  WebhookEndpoint,
  WebhookSecretResponse,
} from '../types/index.js'

export class WebhooksResource {
  constructor(private readonly http: HttpClient) {}

  async list(params?: { programId?: string }): Promise<WebhookEndpoint[]> {
    const envelope = await this.http.request<{ data: WebhookEndpoint[]; meta: unknown }>({
      method: 'GET',
      path: '/webhooks',
      query: params,
    })
    return envelope.data
  }

  async create(data: CreateWebhookEndpointParams): Promise<WebhookSecretResponse> {
    const envelope = await this.http.request<{ data: WebhookSecretResponse; meta: unknown }>({
      method: 'POST',
      path: '/webhooks',
      body: data,
    })
    return envelope.data
  }

  async get(id: string): Promise<WebhookEndpoint> {
    const envelope = await this.http.request<{ data: WebhookEndpoint; meta: unknown }>({
      method: 'GET',
      path: `/webhooks/${id}`,
    })
    return envelope.data
  }

  async update(id: string, data: UpdateWebhookEndpointParams): Promise<WebhookEndpoint> {
    const envelope = await this.http.request<{ data: WebhookEndpoint; meta: unknown }>({
      method: 'PATCH',
      path: `/webhooks/${id}`,
      body: data,
    })
    return envelope.data
  }

  async delete(id: string): Promise<SuccessResponse> {
    const envelope = await this.http.request<{ data: SuccessResponse; meta: unknown }>({
      method: 'DELETE',
      path: `/webhooks/${id}`,
    })
    return envelope.data
  }

  async rotateSecret(id: string): Promise<WebhookSecretResponse> {
    const envelope = await this.http.request<{ data: WebhookSecretResponse; meta: unknown }>({
      method: 'POST',
      path: `/webhooks/${id}/rotate-secret`,
    })
    return envelope.data
  }
}
