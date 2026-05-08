import type { HttpClient } from '../http.js'
import type {
  CompleteMarketingSocialPostMediaUploadParams,
  CreateMarketingSocialPostMediaUploadSessionParams,
  CreateMarketingSocialPostParams,
  ListAffiliateMarketingResourcesParams,
  ListMarketingResourcesParams,
  MarketingResource,
  MarketingResourceDownloadTarget,
  MarketingResourceDownloadUrl,
  MarketingResourceProgramTarget,
  MarketingResourceUploadSession,
  MutationOptions,
  PublishMarketingResourceParams,
  PublishMarketingResourceResponse,
  RemoveMarketingResourceMediaResponse,
  RenderedMarketingSocialPost,
  RenderMarketingSocialPostParams,
  ReorderMarketingSocialPostMediaParams,
  ReplaceMarketingSocialPostMediaParams,
  UpdateMarketingSocialPostMediaParams,
  UpdateMarketingSocialPostParams,
} from '../types/index.js'

function socialPostBody(data: CreateMarketingSocialPostParams | UpdateMarketingSocialPostParams) {
  return {
    title: data.title,
    description: data.description,
    body: data.body,
    platforms: data.platforms,
    instructions: data.instructions,
    collection_id: data.collectionId,
    folder_id: data.folderId,
    status: 'status' in data ? data.status : undefined,
    program_id: 'programId' in data ? data.programId : undefined,
  }
}

function programTargetBody(data: MarketingResourceProgramTarget) {
  return { program_id: data.programId }
}

function downloadTargetBody(data: MarketingResourceDownloadTarget) {
  return {
    program_id: data.programId,
    media_id: data.mediaId,
    resource_id: data.resourceId,
    collection_id: data.collectionId,
    bundle: data.bundle,
    file: data.file,
  }
}

function uploadSessionBody(data: CreateMarketingSocialPostMediaUploadSessionParams) {
  return {
    program_id: data.programId,
    file_name: data.fileName,
    mime_type: data.mimeType,
    file_size_bytes: data.fileSizeBytes,
  }
}

function completeUploadBody(data: CompleteMarketingSocialPostMediaUploadParams | ReplaceMarketingSocialPostMediaParams) {
  return {
    program_id: data.programId,
    upload_path: data.uploadPath,
    upload_token: data.uploadToken,
    file_name: data.fileName,
    alt_text: data.altText,
    sort_order: data.sortOrder,
  }
}

export class MarketingResourcesResource {
  constructor(private readonly http: HttpClient) {}

  async list(programId: string, params?: ListMarketingResourcesParams): Promise<MarketingResource[]> {
    const envelope = await this.http.request<{ data: MarketingResource[]; meta: unknown }>({
      method: 'GET',
      path: `/programs/${programId}/marketing-resources`,
      query: {
        kind: params?.kind,
        status: params?.status,
        search: params?.search,
        limit: params?.limit,
        offset: params?.offset,
      },
    })
    return envelope.data
  }

  async createSocialPost(
    programId: string,
    data: CreateMarketingSocialPostParams,
    options?: MutationOptions
  ): Promise<MarketingResource> {
    const envelope = await this.http.request<{ data: MarketingResource; meta: unknown }>({
      method: 'POST',
      path: `/programs/${programId}/marketing-resources/social-posts`,
      body: socialPostBody(data),
      idempotencyKey: options?.idempotencyKey,
    })
    return envelope.data
  }

  async updateSocialPost(
    resourceId: string,
    data: UpdateMarketingSocialPostParams,
    options?: MutationOptions
  ): Promise<MarketingResource> {
    const envelope = await this.http.request<{ data: MarketingResource; meta: unknown }>({
      method: 'PATCH',
      path: `/marketing-resources/social-posts/${resourceId}`,
      body: socialPostBody(data),
      idempotencyKey: options?.idempotencyKey,
    })
    return envelope.data
  }

  async createSocialPostMediaUploadSession(
    resourceId: string,
    data: CreateMarketingSocialPostMediaUploadSessionParams,
    options?: MutationOptions
  ): Promise<MarketingResourceUploadSession> {
    const envelope = await this.http.request<{ data: MarketingResourceUploadSession; meta: unknown }>({
      method: 'POST',
      path: `/marketing-resources/social-posts/${resourceId}/media/upload-sessions`,
      body: uploadSessionBody(data),
      idempotencyKey: options?.idempotencyKey,
    })
    return envelope.data
  }

  async completeSocialPostMediaUpload(
    resourceId: string,
    data: CompleteMarketingSocialPostMediaUploadParams,
    options?: MutationOptions
  ): Promise<MarketingResource> {
    const envelope = await this.http.request<{ data: MarketingResource; meta: unknown }>({
      method: 'POST',
      path: `/marketing-resources/social-posts/${resourceId}/media/complete`,
      body: completeUploadBody(data),
      idempotencyKey: options?.idempotencyKey,
    })
    return envelope.data
  }

  async reorderSocialPostMedia(
    resourceId: string,
    data: ReorderMarketingSocialPostMediaParams,
    options?: MutationOptions
  ): Promise<MarketingResource[]> {
    const envelope = await this.http.request<{ data: MarketingResource[]; meta: unknown }>({
      method: 'POST',
      path: `/marketing-resources/social-posts/${resourceId}/media/reorder`,
      body: { program_id: data.programId, media_ids: data.mediaIds },
      idempotencyKey: options?.idempotencyKey,
    })
    return envelope.data
  }

  async updateSocialPostMedia(
    resourceId: string,
    mediaId: string,
    data: UpdateMarketingSocialPostMediaParams,
    options?: MutationOptions
  ): Promise<MarketingResource> {
    const envelope = await this.http.request<{ data: MarketingResource; meta: unknown }>({
      method: 'PATCH',
      path: `/marketing-resources/social-posts/${resourceId}/media/${mediaId}`,
      body: { program_id: data.programId, alt_text: data.altText },
      idempotencyKey: options?.idempotencyKey,
    })
    return envelope.data
  }

  async removeSocialPostMedia(
    resourceId: string,
    mediaId: string,
    data: MarketingResourceProgramTarget,
    options?: MutationOptions
  ): Promise<RemoveMarketingResourceMediaResponse> {
    const envelope = await this.http.request<{ data: RemoveMarketingResourceMediaResponse; meta: unknown }>({
      method: 'DELETE',
      path: `/marketing-resources/social-posts/${resourceId}/media/${mediaId}`,
      body: programTargetBody(data),
      idempotencyKey: options?.idempotencyKey,
    })
    return envelope.data
  }

  async replaceSocialPostMedia(
    resourceId: string,
    mediaId: string,
    data: ReplaceMarketingSocialPostMediaParams,
    options?: MutationOptions
  ): Promise<MarketingResource> {
    const envelope = await this.http.request<{ data: MarketingResource; meta: unknown }>({
      method: 'POST',
      path: `/marketing-resources/social-posts/${resourceId}/media/${mediaId}/replace`,
      body: completeUploadBody(data),
      idempotencyKey: options?.idempotencyKey,
    })
    return envelope.data
  }

  async publish(
    resourceId: string,
    data: PublishMarketingResourceParams,
    options?: MutationOptions
  ): Promise<PublishMarketingResourceResponse> {
    const envelope = await this.http.request<{ data: PublishMarketingResourceResponse; meta: unknown }>({
      method: 'POST',
      path: `/marketing-resources/${resourceId}/publish`,
      body: { program_id: data.programId, notify_affiliates: data.notifyAffiliates },
      idempotencyKey: options?.idempotencyKey,
    })
    return envelope.data
  }

  async unpublish(resourceId: string, data: MarketingResourceProgramTarget, options?: MutationOptions): Promise<MarketingResource> {
    return this.statusMutation(resourceId, 'unpublish', data, options)
  }

  async archive(resourceId: string, data: MarketingResourceProgramTarget, options?: MutationOptions): Promise<MarketingResource> {
    return this.statusMutation(resourceId, 'archive', data, options)
  }

  async notifyAffiliates(resourceId: string, data: MarketingResourceProgramTarget, options?: MutationOptions): Promise<Record<string, unknown>> {
    const envelope = await this.http.request<{ data: Record<string, unknown>; meta: unknown }>({
      method: 'POST',
      path: `/marketing-resources/${resourceId}/notify`,
      body: programTargetBody(data),
      idempotencyKey: options?.idempotencyKey,
    })
    return envelope.data
  }

  async createDownloadUrl(
    data: MarketingResourceDownloadTarget,
    options?: MutationOptions
  ): Promise<MarketingResourceDownloadUrl> {
    const envelope = await this.http.request<{ data: MarketingResourceDownloadUrl; meta: unknown }>({
      method: 'POST',
      path: '/marketing-resources/download-url',
      body: downloadTargetBody(data),
      idempotencyKey: options?.idempotencyKey,
    })
    return envelope.data
  }

  async listForAffiliate(programId: string, params?: ListAffiliateMarketingResourcesParams): Promise<MarketingResource[]> {
    const envelope = await this.http.request<{ data: MarketingResource[]; meta: unknown }>({
      method: 'GET',
      path: `/me/programs/${programId}/marketing-resources`,
      query: {
        kind: params?.kind,
        search: params?.search,
        limit: params?.limit,
        offset: params?.offset,
      },
    })
    return envelope.data
  }

  async getForAffiliate(resourceId: string, params: MarketingResourceProgramTarget): Promise<MarketingResource> {
    const envelope = await this.http.request<{ data: MarketingResource; meta: unknown }>({
      method: 'GET',
      path: `/me/marketing-resources/${resourceId}`,
      query: { program_id: params.programId },
    })
    return envelope.data
  }

  async createAffiliateDownloadUrl(data: MarketingResourceDownloadTarget): Promise<MarketingResourceDownloadUrl> {
    const envelope = await this.http.request<{ data: MarketingResourceDownloadUrl; meta: unknown }>({
      method: 'POST',
      path: '/me/marketing-resources/download-url',
      body: downloadTargetBody(data),
    })
    return envelope.data
  }

  async renderSocialPost(resourceId: string, data: RenderMarketingSocialPostParams): Promise<RenderedMarketingSocialPost> {
    const envelope = await this.http.request<{ data: RenderedMarketingSocialPost; meta: unknown }>({
      method: 'POST',
      path: `/me/marketing-resources/social-posts/${resourceId}/render`,
      body: { program_id: data.programId, affiliate_link_id: data.affiliateLinkId },
    })
    return envelope.data
  }

  private async statusMutation(
    resourceId: string,
    action: 'unpublish' | 'archive',
    data: MarketingResourceProgramTarget,
    options?: MutationOptions
  ): Promise<MarketingResource> {
    const envelope = await this.http.request<{ data: MarketingResource; meta: unknown }>({
      method: 'POST',
      path: `/marketing-resources/${resourceId}/${action}`,
      body: programTargetBody(data),
      idempotencyKey: options?.idempotencyKey,
    })
    return envelope.data
  }
}
