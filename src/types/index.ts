export interface PaginationMeta {
  total: number
  page: number
  pageSize: number
  hasMore: boolean
  nextCursor?: string
  requestId: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

export interface AffiliateWorkspaceOverviewProgramStats {
  programId: string
  programName: string
  totalClicks: number
  totalConversions: number
  totalRevenue: number
  totalCommission: number
  totalPaidOut: number
}

export interface AffiliateWorkspaceOverview {
  affiliateProfileId: string
  programCount: number
  activeProgramCount: number
  totalEarnings: number
  pendingEarnings: number
  availableEarnings: number
  paidEarnings: number
  programStats: AffiliateWorkspaceOverviewProgramStats[]
}

export interface AffiliateWorkspaceProgram {
  affiliateId: string
  programId: string
  programName: string
  programDescription: string | null
  companyName: string | null
  portalSlug: string | null
  portalTheme: string | null
  marketplaceLogoUrl: string | null
  commissionType: CommissionType
  commissionPercent: number
  code: string
  isApproved: boolean
  isBlocked: boolean
  totalClicks: number
  totalConversions: number
  totalRevenue: number
  totalCommission: number
  totalPaidOut: number
  createdAt: string
}

export interface AffiliateWorkspaceProgramDetail {
  affiliateId: string
  programId: string
  programName: string
  programDescription: string | null
  merchantCompanyName: string | null
  portalTheme: string | null
  marketplaceLogoUrl: string | null
  website: string | null
  landingPageUrl: string | null
  commissionType: CommissionType
  commissionPercent: number
  commissionLimitMonths: number | null
  cookieDuration: number
  payoutThreshold: number
  payoutFrequency: string
  currency: string
  payoutCompliance: Record<string, unknown>
  termsUrl: string | null
  code: string
  isApproved: boolean
  isBlocked: boolean
  payoutMethod: string | null
  paypalEmail: string | null
  bankAccountHolder: string | null
  bankIban: string | null
  bankBic: string | null
  firstName: string | null
  lastName: string | null
  companyName: string | null
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  state: string | null
  postalCode: string | null
  country: string | null
  vatId: string | null
  taxIdType: string | null
  taxId: string | null
  taxFormCompleted: boolean
  totalClicks: number
  totalConversions: number
  totalRevenue: number
  totalCommission: number
  totalPaidOut: number
  pendingCommission: number
  createdAt: string
}

export interface AgentRefConfig {
  apiKey?: string
  baseUrl?: string
  timeout?: number
  maxRetries?: number
  dangerouslyAllowBrowser?: boolean
}

export interface MutationOptions {
  idempotencyKey?: string
}

export type ApiObject = Record<string, unknown>

export type BillingRequirementStatus =
  | 'not_required'
  | 'required'
  | 'grace_period'
  | 'restricted'
  | 'active'

export interface Merchant {
  id: string
  userId: string
  companyName: string
  logoUrl: string | null
  billingTier: string
  billingRequirementStatus: BillingRequirementStatus
  paymentStatus: string
  lastPaymentFailedAt: string | null
  defaultCookieDuration: number
  defaultPayoutThreshold: number
  timezone: string
  trackingRequiresConsent: boolean
  trackingParamAliases: string[]
  notificationPreferences: NotificationPreferences | null
  onboardingCompleted: boolean
  onboardingStep: number
  createdAt: string
  updatedAt: string
}

export interface UpdateMerchantParams {
  companyName?: string
  logoUrl?: string
  timezone?: string
  defaultCookieDuration?: number
  defaultPayoutThreshold?: number
  trackingRequiresConsent?: boolean
  trackingParamAliases?: string[]
}

export type CommissionType = 'one_time' | 'recurring' | 'recurring_limited'
export type ProgramStatus = 'active' | 'paused' | 'archived'
export type ProgramMarketplaceStatus = 'private' | 'draft' | 'public'
export type ProgramMarketplaceVisibility = ProgramMarketplaceStatus
export type ProgramApplicationAccess = 'open' | 'invite_only'
export type ProgramReadiness = 'setup' | 'partial' | 'ready'
export type StripeConnectMethod = 'oauth_url'

export interface Program {
  id: string
  merchantId: string
  name: string
  description: string | null
  slug: string
  website: string | null
  landingPageUrl: string | null
  portalSlug: string | null
  status: ProgramStatus
  marketplaceStatus: ProgramMarketplaceStatus
  applicationAccess?: ProgramApplicationAccess
  marketplaceCategory: string | null
  marketplaceDescription: string | null
  marketplaceLogoUrl: string | null
  commissionType: CommissionType
  commissionPercent: number
  commissionLimitMonths: number | null
  commissionHoldDays: number
  cookieDuration: number
  trackingRequiresConsent: boolean | null
  trackingParamAliases: string[] | null
  payoutThreshold: number
  currency: string
  autoApproveAffiliates: boolean
  termsUrl: string | null
  stripeAccountId: string | null
  stripeConnectedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ProgramDetail extends Program {
  readiness: ProgramReadiness
}

export interface UpdateProgramMarketplaceParams {
  status?: ProgramMarketplaceVisibility
  category?: string
  description?: string
  logoUrl?: string
}

export interface CreateProgramParams {
  name: string
  commissionType: CommissionType
  commissionPercent: number
  website?: string
  cookieDuration?: number
  payoutThreshold?: number
  autoApproveAffiliates?: boolean
  description?: string
  landingPageUrl?: string
  commissionLimitMonths?: number
  portalSlug?: string
  currency?: string
  marketplaceStatus?: ProgramMarketplaceStatus
  applicationAccess?: ProgramApplicationAccess
  marketplaceCategory?: string
  marketplaceDescription?: string
  marketplaceLogoUrl?: string
}

export interface UpdateProgramParams {
  name?: string
  commissionType?: CommissionType
  commissionPercent?: number
  website?: string
  cookieDuration?: number
  payoutThreshold?: number
  autoApproveAffiliates?: boolean
  description?: string
  landingPageUrl?: string
  status?: ProgramStatus
  portalSlug?: string | null
  currency?: string
  commissionLimitMonths?: number | null
  marketplaceStatus?: ProgramMarketplaceStatus
  applicationAccess?: ProgramApplicationAccess
  marketplaceCategory?: string | null
  marketplaceDescription?: string | null
  marketplaceLogoUrl?: string | null
}

export interface ConnectProgramStripeParams {
  method?: StripeConnectMethod
}

export interface ConnectProgramStripeResponse {
  connected: boolean
  method: StripeConnectMethod
  programId: string
  programReadiness?: ProgramReadiness
  authUrl?: string
  message: string
}

export interface DisconnectProgramStripeResponse {
  success: boolean
  programId: string
}

export interface SuccessResponse {
  success: boolean
}

export interface CreateCouponParams {
  affiliateId: string
  code: string
  expiresAt?: string
}

export interface ProgramStats {
  programId: string
  programName: string
  status: ProgramStatus
  totalRevenue: number
  totalConversions: number
  totalCommissions: number
  pendingCommissions: number
  activeAffiliates: number
  conversionsByStatus: {
    pending: number
    approved: number
    partiallyRefunded?: number
    rejected: number
    refunded: number
  }
}

export type AffiliateStatus = 'approved' | 'blocked'

export interface Affiliate {
  id: string
  userId: string
  programId: string
  code: string
  status: AffiliateStatus
  totalClicks: number
  totalConversions: number
  totalEarnings: number
  createdAt: string
}

export type ConversionStatus = 'pending' | 'approved' | 'partially_refunded' | 'rejected' | 'refunded'

export interface Conversion {
  id: string
  affiliateId: string
  programId: string
  amount: number
  commission: number
  status: ConversionStatus
  method: 'cookie' | 'coupon' | 'metadata'
  stripeSessionId: string | null
  createdAt: string
}

export interface ConversionStats {
  total: number
  pending: number
  approved: number
  totalRevenue: number
  totalCommissions: number
}

export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface Payout {
  id: string
  affiliateId: string
  amount: number
  status: PayoutStatus
  method: string | null
  createdAt: string
  completedAt: string | null
}

export interface CreatePayoutParams {
  affiliateId: string
  programId: string
  method: 'paypal' | 'bank_transfer'
  notes?: string
}

export interface PendingAffiliate {
  affiliateId: string
  email: string
  name: string | null
  code: string
  programId: string
  programName: string
  payoutMethod: 'paypal' | 'bank_transfer' | null
  paypalEmail: string | null
  bankIban: string | null
  pendingAmount: number
  currency: string
  threshold: number
  meetsThreshold: boolean
  commissionCount: number
  hasPayoutMethod: boolean
}

export interface PayoutStats {
  totalPaid: number
  totalPending: number
  count: number
}

export type FlagStatus = 'open' | 'reviewed' | 'dismissed' | 'confirmed'
export type FlagType =
  | 'suspicious_activity'
  | 'self_referral'
  | 'high_click_frequency'
  | 'conversion_anomaly'
  | 'manual_review'

export interface Flag {
  id: string
  affiliateId: string
  type: FlagType
  status: FlagStatus
  details: Record<string, unknown> | null
  note: string | null
  createdAt: string
  resolvedAt: string | null
}

export interface FlagStats {
  open: number
  reviewed: number
  dismissed: number
  confirmed: number
  total: number
}

export interface ResolveFlagParams {
  status: 'reviewed' | 'dismissed' | 'confirmed'
  note?: string
  blockAffiliate?: boolean
}

export type BillingTierId = 'free' | 'starter' | 'growth' | 'pro'

export interface BillingTier {
  id: BillingTierId
  name: string
  price: number
  maxRevenue: number
  features: string[]
  bookable: boolean
}

export interface BillingStatus {
  tier: BillingTierId
  monthlyRevenue: number
  nextTier: BillingTierId | null
  stripeSubscriptionId: string | null
}

export interface Coupon {
  id: string
  code: string
  affiliateId: string
  programId: string
  createdAt: string
}

export interface Invite {
  token: string
  email: string
  programId: string
  expiresAt: string
  createdAt: string
}

export type AffiliateSortBy = 'createdAt' | 'totalClicks' | 'totalRevenue' | 'name'
export type SortOrder = 'asc' | 'desc'

export interface CreateInviteParams {
  email?: string
  name?: string
  isPublic?: boolean
  usageLimit?: number
  expiresInDays?: number
  trackingCode?: string
  skipOnboarding?: boolean
}

export interface PayoutInfo {
  payoutMethod: 'paypal' | 'bank_transfer' | null
  paypalEmail: string | null
  bankAccountHolder: string | null
  bankIban: string | null
  bankBic: string | null
  firstName: string | null
  lastName: string | null
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  state: string | null
  postalCode: string | null
  vatId: string | null
}

export interface UpdatePayoutInfoParams {
  payoutMethod?: 'paypal' | 'bank_transfer'
  paypalEmail?: string
  bankAccountHolder?: string
  bankIban?: string
  bankBic?: string
  firstName?: string
  lastName?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  postalCode?: string
  vatId?: string
}

export interface NotificationPreferences {
  newAffiliate: boolean
  newConversion: boolean
  commissionApproved: boolean
  payoutProcessed: boolean
  weeklyDigest: boolean
}

export interface UpdateNotificationPreferencesParams {
  newAffiliate?: boolean
  newConversion?: boolean
  commissionApproved?: boolean
  payoutProcessed?: boolean
  weeklyDigest?: boolean
}

export type ApplicationStatus = 'pending' | 'approved' | 'declined' | 'withdrawn' | 'blocked'
export type ApplicationSource = 'browser' | 'api' | 'mcp' | 'invite' | 'import'

export interface Application extends ApiObject {
  id: string
  status?: ApplicationStatus
}

export interface ReviewApplicationParams {
  note?: string
}

export interface AffiliateWorkspaceIdentity extends ApiObject {
  key: ApiObject
  owner: ApiObject
}

export interface AffiliateLink extends ApiObject {
  id: string
  name?: string
  code?: string
  targetUrl?: string | null
  isActive?: boolean
}

export interface CreateAffiliateLinkParams {
  name: string
  destinationPath?: string
  customSlug?: string
}

export interface UpdateAffiliateLinkParams {
  name?: string
  targetUrl?: string | null
  isActive?: boolean
}

export interface AffiliateProgramQuery {
  programId?: string
}

export type MarketingResourceKind = 'all' | 'collections' | 'files' | 'social_posts' | 'swipe_copy' | 'links'
export type MerchantMarketingResourceKind = MarketingResourceKind | 'drafts'
export type MarketingResourceStatus = 'published' | 'draft' | 'archived'
export type MarketingResourcePlatform =
  | 'x'
  | 'linkedin'
  | 'instagram'
  | 'tiktok'
  | 'facebook'
  | 'threads'
  | 'generic'

export interface MarketingResource extends ApiObject {
  id: string
  title?: string
  kind?: string
}

export interface ListMarketingResourcesParams {
  kind?: MerchantMarketingResourceKind
  status?: MarketingResourceStatus
  search?: string
  limit?: number
  offset?: number
}

export interface ListAffiliateMarketingResourcesParams {
  kind?: MarketingResourceKind
  search?: string
  limit?: number
  offset?: number
}

export interface CreateMarketingSocialPostParams {
  title: string
  description?: string | null
  body: string
  platforms: MarketingResourcePlatform[]
  instructions?: string | null
  collectionId?: string | null
  folderId?: string | null
  status?: 'draft' | 'published'
}

export interface UpdateMarketingSocialPostParams {
  programId: string
  title?: string
  description?: string | null
  body?: string
  platforms?: MarketingResourcePlatform[]
  instructions?: string | null
  collectionId?: string | null
  folderId?: string | null
}

export interface MarketingResourceProgramTarget {
  programId: string
}

export interface PublishMarketingResourceParams extends MarketingResourceProgramTarget {
  notifyAffiliates?: boolean
}

export interface MarketingResourceDownloadTarget extends MarketingResourceProgramTarget {
  mediaId?: string
  resourceId?: string
  collectionId?: string
  bundle?: 'social_post_media' | 'collection_files'
  file?: true
}

export interface MarketingResourceDownloadUrl extends ApiObject {
  url: string
  expires_at?: string
  target?: unknown
}

export interface CreateMarketingSocialPostMediaUploadSessionParams extends MarketingResourceProgramTarget {
  fileName: string
  mimeType: string
  fileSizeBytes: number
}

export interface MarketingResourceUploadSession extends ApiObject {
  bucket: string
  upload_path: string
  upload_token: string
  signed_url: string
  expires_in_seconds: number
}

export interface CompleteMarketingSocialPostMediaUploadParams extends MarketingResourceProgramTarget {
  uploadPath: string
  uploadToken: string
  fileName: string
  altText?: string | null
  sortOrder?: number
}

export interface ReorderMarketingSocialPostMediaParams extends MarketingResourceProgramTarget {
  mediaIds: string[]
}

export interface UpdateMarketingSocialPostMediaParams extends MarketingResourceProgramTarget {
  altText?: string | null
}

export interface ReplaceMarketingSocialPostMediaParams extends CompleteMarketingSocialPostMediaUploadParams {}

export interface PublishMarketingResourceResponse extends ApiObject {
  resource: MarketingResource
  notification: {
    requested: boolean
    accepted?: boolean
    error_code?: string | null
    message?: string | null
  }
}

export interface RemoveMarketingResourceMediaResponse extends ApiObject {
  removed: boolean
  media_id: string
}

export interface RenderMarketingSocialPostParams extends MarketingResourceProgramTarget {
  affiliateLinkId?: string
}

export interface RenderedMarketingSocialPost extends ApiObject {
  body?: string
  disclosure?: string
}

export interface OnboardingMerchantProfile {
  merchantId: string
  companyName: string
}

export interface CompleteOnboardingResponse {
  onboardingCompleted: boolean
  onboardingStep: number
}

export interface ProgramTrackingStatus extends ApiObject {
  programId: string
}

export interface MarketplaceProgram extends ApiObject {
  programId?: string
  id?: string
  commissionPercent?: number
}

export interface ApplyToMarketplaceProgramParams {
  message?: string
}

export type WebhookEventType =
  | 'program.created'
  | 'program.updated'
  | 'affiliate.joined'
  | 'affiliate.approved'
  | 'affiliate.blocked'
  | 'affiliate.unblocked'
  | 'conversion.created'
  | 'conversion.refunded'
  | 'payout.created'
  | 'payout.processing'
  | 'payout.completed'
  | 'payout.failed'
  | 'flag.resolved'

export type WebhookEndpointStatus = 'active' | 'disabled'

export interface WebhookEndpoint {
  id: string
  name: string
  url: string
  status: WebhookEndpointStatus
  programId: string | null
  schemaVersion: 2
  subscribedEvents: WebhookEventType[]
  secretLastFour: string | null
  createdAt: string
  updatedAt: string
  disabledAt: string | null
}

export interface CreateWebhookEndpointParams {
  name: string
  url: string
  programId?: string
  schemaVersion?: 2
  subscribedEvents: WebhookEventType[]
}

export interface UpdateWebhookEndpointParams {
  name?: string
  url?: string
  programId?: string | null
  schemaVersion?: 2
  subscribedEvents?: WebhookEventType[]
}

export interface WebhookSecretResponse {
  endpoint: WebhookEndpoint
  signingSecret: string
}
