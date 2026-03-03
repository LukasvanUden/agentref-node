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
  companyName?: string | null
  domain?: string | null
  domainVerified?: boolean
  trustLevel?: string
  stripeConnected?: boolean
  createdAt?: string
  [key: string]: unknown
}

export type CommissionType = 'one_time' | 'recurring' | 'recurring_limited'
export type ProgramStatus = 'active' | 'paused' | 'archived'

export interface Program {
  id: string
  name: string
  description?: string | null
  landingPageUrl?: string | null
  commissionType: CommissionType
  commissionPercent: number
  commissionLimitMonths?: number | null
  cookieDuration: number
  payoutThreshold: number
  autoApproveAffiliates: boolean
  status: ProgramStatus
  isPublic?: boolean
  merchantId?: string
  createdAt?: string
  updatedAt?: string
  [key: string]: unknown
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
}

export interface CreateCouponParams {
  affiliateId: string
  code: string
  expiresAt?: string
}

export interface ProgramStats {
  [key: string]: unknown
}

export type AffiliateStatus = 'pending' | 'approved' | 'blocked'

export interface Affiliate {
  id: string
  userId?: string
  programId?: string
  code?: string
  status?: AffiliateStatus | string
  totalClicks?: number
  totalConversions?: number
  totalEarnings?: number
  createdAt?: string
  [key: string]: unknown
}

export type ConversionStatus = 'pending' | 'approved' | 'rejected' | 'refunded'

export interface Conversion {
  id: string
  affiliateId?: string
  programId?: string
  amount?: number
  commission?: number
  status?: ConversionStatus | string
  method?: 'cookie' | 'coupon' | 'metadata' | string
  stripeSessionId?: string | null
  createdAt?: string
  [key: string]: unknown
}

export interface ConversionStats {
  [key: string]: unknown
}

export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface Payout {
  id: string
  affiliateId?: string
  amount?: number
  status?: PayoutStatus | string
  method?: string | null
  createdAt?: string
  completedAt?: string | null
  [key: string]: unknown
}

export interface PendingAffiliate {
  affiliateId?: string
  email?: string
  name?: string | null
  code?: string
  programId?: string
  programName?: string
  payoutMethod?: 'paypal' | 'bank_transfer' | null
  paypalEmail?: string | null
  bankIban?: string | null
  pendingAmount?: number
  currency?: string
  threshold?: number
  meetsThreshold?: boolean
  commissionCount?: number
  hasPayoutMethod?: boolean
  [key: string]: unknown
}

export interface PayoutStats {
  [key: string]: unknown
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
  affiliateId?: string
  type?: FlagType | string
  status?: FlagStatus | string
  details?: Record<string, unknown> | null
  note?: string | null
  createdAt?: string
  resolvedAt?: string | null
  [key: string]: unknown
}

export interface FlagStats {
  [key: string]: unknown
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
  maxRevenue?: number
  features?: string[]
  bookable?: boolean
  [key: string]: unknown
}

export interface BillingStatus {
  tier?: BillingTierId | string
  monthlyRevenue?: number
  nextTier?: BillingTierId | string | null
  stripeSubscriptionId?: string | null
  [key: string]: unknown
}

export interface Coupon {
  id: string
  code: string
  affiliateId?: string
  programId?: string
  createdAt?: string
  [key: string]: unknown
}

export interface Invite {
  token?: string
  email?: string
  programId?: string
  expiresAt?: string
  createdAt?: string
  [key: string]: unknown
}
