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

export interface Merchant {
  id: string
  email: string
  companyName: string | null
  domain: string | null
  domainVerified: boolean
  trustLevel: string
  stripeConnected: boolean
  createdAt: string
}

export interface UpdateMerchantParams {
  companyName?: string
  website?: string
  logoUrl?: string
  timezone?: string
  defaultCookieDuration?: number
  defaultPayoutThreshold?: number
}

export interface MerchantDomainStatus {
  domain: string | null
  verified: boolean
  txtRecord: string | null
}

export interface StripeConnectSession {
  url: string
}

export type CommissionType = 'one_time' | 'recurring' | 'recurring_limited'
export type ProgramStatus = 'active' | 'paused' | 'archived'
export type ProgramMarketplaceVisibility = 'private' | 'public'

export interface Program {
  id: string
  name: string
  description: string | null
  landingPageUrl: string | null
  commissionType: CommissionType
  commissionPercent: number
  commissionLimitMonths: number | null
  cookieDuration: number
  payoutThreshold: number
  autoApproveAffiliates: boolean
  status: ProgramStatus
  isPublic: boolean
  merchantId: string
  createdAt: string
  updatedAt: string
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
  isPublic?: boolean
}

export interface CreateCouponParams {
  affiliateId: string
  code: string
  expiresAt?: string
}

export interface ProgramStats {
  clicks: number
  conversions: number
  revenue: number
  commissions: number
  period: string
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
