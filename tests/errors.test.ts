import { describe, it, expect } from 'vitest'
import {
  AgentRefError,
  AuthError,
  ForbiddenError,
  ValidationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ServerError,
} from '../src/errors.js'

describe('AgentRefError', () => {
  it('is base class for all errors', () => {
    const error = new AuthError('Unauthorized', 'INVALID_AUTH', 'req_123')
    expect(error).toBeInstanceOf(AgentRefError)
    expect(error).toBeInstanceOf(Error)
  })

  it('has code, status and requestId on all errors', () => {
    const error = new NotFoundError('Not found', 'NOT_FOUND', 'req_abc')
    expect(error.code).toBe('NOT_FOUND')
    expect(error.status).toBe(404)
    expect(error.requestId).toBe('req_abc')
    expect(error.message).toBe('Not found')
  })
})

describe('Specific errors', () => {
  it('AuthError has status 401', () => {
    expect(new AuthError('msg', 'INVALID_AUTH', 'req').status).toBe(401)
  })

  it('ForbiddenError has status 403 and is not ServerError', () => {
    const error = new ForbiddenError('Forbidden', 'FORBIDDEN', 'req_x')
    expect(error.status).toBe(403)
    expect(error).not.toBeInstanceOf(ServerError)
  })

  it('ValidationError stores details', () => {
    const details = { fields: { name: 'required' } }
    const error = new ValidationError('Validation failed', 'VALIDATION_ERROR', 'req', details)
    expect(error.status).toBe(400)
    expect(error.details).toEqual(details)
  })

  it('ConflictError has status 409', () => {
    expect(new ConflictError('Conflict', 'CONFLICT', 'req').status).toBe(409)
  })

  it('RateLimitError has retryAfter', () => {
    const error = new RateLimitError('Rate limited', 'RATE_LIMITED', 'req', 30)
    expect(error.status).toBe(429)
    expect(error.retryAfter).toBe(30)
  })

  it('ServerError accepts any 5xx status', () => {
    expect(new ServerError('Error', 'INTERNAL_ERROR', 503, 'req').status).toBe(503)
  })
})
