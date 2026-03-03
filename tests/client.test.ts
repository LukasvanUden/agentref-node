import { describe, it, expect } from 'vitest'
import { AgentRef } from '../src/index.js'

describe('AgentRef client', () => {
  it('instantiates with apiKey and exposes all resources', () => {
    const client = new AgentRef({ apiKey: 'ak_live_test' })
    expect(client.programs).toBeDefined()
    expect(client.affiliates).toBeDefined()
    expect(client.conversions).toBeDefined()
    expect(client.payouts).toBeDefined()
    expect(client.flags).toBeDefined()
    expect(client.billing).toBeDefined()
    expect(client.merchant).toBeDefined()
  })

  it('throws without apiKey and env', () => {
    const saved = process.env.AGENTREF_API_KEY
    delete process.env.AGENTREF_API_KEY
    expect(() => new AgentRef()).toThrow('API key is required')
    if (saved) process.env.AGENTREF_API_KEY = saved
  })

  it('throws in browser context without dangerouslyAllowBrowser', () => {
    const g = global as unknown as Record<string, unknown>
    g.window = {}
    expect(() => new AgentRef({ apiKey: 'ak_live_test' })).toThrow('Refusing to initialize in browser context')
    delete g.window
  })
})
