export class AgentRefError extends Error {
  readonly code: string
  readonly status: number
  readonly requestId: string

  constructor(message: string, code: string, status: number, requestId: string) {
    super(message)
    this.name = 'AgentRefError'
    this.code = code
    this.status = status
    this.requestId = requestId
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class AuthError extends AgentRefError {
  constructor(message: string, code: string, requestId: string) {
    super(message, code, 401, requestId)
    this.name = 'AuthError'
  }
}

export class ForbiddenError extends AgentRefError {
  constructor(message: string, code: string, requestId: string) {
    super(message, code, 403, requestId)
    this.name = 'ForbiddenError'
  }
}

export class ValidationError extends AgentRefError {
  readonly details: unknown

  constructor(message: string, code: string, requestId: string, details?: unknown) {
    super(message, code, 400, requestId)
    this.name = 'ValidationError'
    this.details = details
  }
}

export class NotFoundError extends AgentRefError {
  constructor(message: string, code: string, requestId: string) {
    super(message, code, 404, requestId)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AgentRefError {
  constructor(message: string, code: string, requestId: string) {
    super(message, code, 409, requestId)
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends AgentRefError {
  readonly retryAfter: number

  constructor(message: string, code: string, requestId: string, retryAfter: number) {
    super(message, code, 429, requestId)
    this.name = 'RateLimitError'
    this.retryAfter = retryAfter
  }
}

export class ServerError extends AgentRefError {
  constructor(message: string, code: string, status: number, requestId: string) {
    super(message, code, status, requestId)
    this.name = 'ServerError'
  }
}
