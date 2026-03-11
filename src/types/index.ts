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
  trackingLegacyMetadataFallbackEnabled: boolean
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
  trackingLegacyMetadataFallbackEnabled?: boolean
}

export type CommissionType = 'one_time' | 'recurring' | 'recurring_limited'
export type ProgramStatus = 'active' | 'paused' | 'archived'
export type ProgramMarketplaceStatus = 'private' | 'pending' | 'public'
export type ProgramMarketplaceVisibility = 'private' | 'public'
export type ProgramReadiness = 'setup' | 'partial' | 'ready'
export type StripeConnectMethod = 'oauth_url' | 'restricted_key' | 'fallback_url'

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
  trackingLegacyMetadataFallbackEnabled: boolean | null
  payoutThreshold: number
  currency: string
  autoApproveAffiliates: boolean
  termsUrl: string | null
  stripeAccountId: string | null
  stripeConnectedAt: string | null
  verifiedDomain: string | null
  domainVerificationToken: string | null
  domainVerifiedAt: string | null
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
  cookieDuration?: number
  payoutThreshold?: number
  autoApproveAffiliates?: boolean
  description?: string
  landingPageUrl?: string
  commissionLimitMonths?: number
  portalSlug?: string
  currency?: string
}

export interface UpdateProgramParams {
  name?: string
  commissionType?: CommissionType
  commissionPercent?: number
  cookieDuration?: number
  payoutThreshold?: number
  autoApproveAffiliates?: boolean
  description?: string
  landingPageUrl?: string
  status?: ProgramStatus
  portalSlug?: string | null
  currency?: string
  commissionLimitMonths?: number | null
}

export interface ConnectProgramStripeParams {
  method?: StripeConnectMethod
  stripeAccountId?: string
}

export interface ConnectProgramStripeResponse {
  connected: boolean
  method: StripeConnectMethod
  programId: string
  programReadiness?: ProgramReadiness
  stripeAccountId?: string
  authUrl?: string
  message: string
}

export interface DisconnectProgramStripeResponse {
  success: boolean
  programId: string
}

export interface ProgramDomainVerificationInitResponse {
  programId: string
  domain: string
  token: string
  txtRecord: string
  txtRecordName: string
  message: string
}

export interface ProgramDomainVerificationStatusResponse {
  verified: boolean
  domain: string | null
  verifiedAt: string | null
  programId: string
  programReadiness: ProgramReadiness
  message: string
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
    rejected: number
    refunded: number
  }
}

export type AffiliateStatus = 'pending' | 'approved' | 'blocked'

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

export type ConversionStatus = 'pending' | 'approved' | 'rejected' | 'refunded'

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

export type BillingTierId = 'free' | 'starter' | 'growth' | 'pro' | 'scale'

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
