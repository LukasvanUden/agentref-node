import { HttpClient } from './http.js'
import type { AgentRefConfig } from './types/index.js'
import { AffiliateWorkspaceResource } from './resources/affiliate-workspace.js'
import { AffiliatesResource } from './resources/affiliates.js'
import { ApplicationsResource } from './resources/applications.js'
import { BillingResource } from './resources/billing.js'
import { ConversionsResource } from './resources/conversions.js'
import { FlagsResource } from './resources/flags.js'
import { InvitesResource } from './resources/invites.js'
import { MarketplaceResource } from './resources/marketplace.js'
import { MarketingResourcesResource } from './resources/marketing-resources.js'
import { MerchantResource } from './resources/merchant.js'
import { NotificationsResource } from './resources/notifications.js'
import { OnboardingResource } from './resources/onboarding.js'
import { PayoutInfoResource } from './resources/payout-info.js'
import { PayoutsResource } from './resources/payouts.js'
import { ProgramsResource } from './resources/programs.js'
import { TrackingResource } from './resources/tracking.js'
import { WebhooksResource } from './resources/webhooks.js'

export class AgentRef {
  readonly affiliateWorkspace: AffiliateWorkspaceResource
  readonly applications: ApplicationsResource
  readonly programs: ProgramsResource
  readonly affiliates: AffiliatesResource
  readonly conversions: ConversionsResource
  readonly payouts: PayoutsResource
  readonly flags: FlagsResource
  readonly billing: BillingResource
  readonly merchant: MerchantResource
  readonly notifications: NotificationsResource
  readonly payoutInfo: PayoutInfoResource
  readonly onboarding: OnboardingResource
  readonly tracking: TrackingResource
  readonly invites: InvitesResource
  readonly marketplace: MarketplaceResource
  readonly marketingResources: MarketingResourcesResource
  readonly webhooks: WebhooksResource

  constructor(config?: AgentRefConfig) {
    const http = new HttpClient(config)

    this.affiliateWorkspace = new AffiliateWorkspaceResource(http)
    this.applications = new ApplicationsResource(http)
    this.programs = new ProgramsResource(http)
    this.affiliates = new AffiliatesResource(http)
    this.conversions = new ConversionsResource(http)
    this.payouts = new PayoutsResource(http)
    this.flags = new FlagsResource(http)
    this.billing = new BillingResource(http)
    this.merchant = new MerchantResource(http)
    this.notifications = new NotificationsResource(http)
    this.payoutInfo = new PayoutInfoResource(http)
    this.onboarding = new OnboardingResource(http)
    this.tracking = new TrackingResource(http)
    this.invites = new InvitesResource(http)
    this.marketplace = new MarketplaceResource(http)
    this.marketingResources = new MarketingResourcesResource(http)
    this.webhooks = new WebhooksResource(http)
  }
}
