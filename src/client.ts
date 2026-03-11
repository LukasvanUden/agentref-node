import { HttpClient } from './http.js'
import type { AgentRefConfig } from './types/index.js'
import { AffiliatesResource } from './resources/affiliates.js'
import { BillingResource } from './resources/billing.js'
import { ConversionsResource } from './resources/conversions.js'
import { FlagsResource } from './resources/flags.js'
import { MerchantResource } from './resources/merchant.js'
import { PayoutsResource } from './resources/payouts.js'
import { ProgramsResource } from './resources/programs.js'
import { WebhooksResource } from './resources/webhooks.js'

export class AgentRef {
  readonly programs: ProgramsResource
  readonly affiliates: AffiliatesResource
  readonly conversions: ConversionsResource
  readonly payouts: PayoutsResource
  readonly flags: FlagsResource
  readonly billing: BillingResource
  readonly merchant: MerchantResource
  readonly webhooks: WebhooksResource

  constructor(config?: AgentRefConfig) {
    const http = new HttpClient(config)

    this.programs = new ProgramsResource(http)
    this.affiliates = new AffiliatesResource(http)
    this.conversions = new ConversionsResource(http)
    this.payouts = new PayoutsResource(http)
    this.flags = new FlagsResource(http)
    this.billing = new BillingResource(http)
    this.merchant = new MerchantResource(http)
    this.webhooks = new WebhooksResource(http)
  }
}
