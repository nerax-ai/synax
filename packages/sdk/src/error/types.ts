// ============================================================
// Base Error
// ============================================================

/**
 * Base error class for all Synax errors
 *
 * Plugins should throw this with appropriate statusCode
 * Dispatcher can use statusCode to decide retry strategy
 */
export class SynaxError extends Error {
  readonly name = 'SynaxError';

  constructor(
    message: string,
    /** Machine-readable error code (e.g., 'RATE_LIMIT', 'AUTH_ERROR') */
    public readonly code: string,
    /** HTTP-like status code for categorizing the error */
    public readonly statusCode: number = 500,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}

// ============================================================
// Dispatcher Errors
// ============================================================

/**
 * Error information for a failed candidate during dispatch
 */
export interface CandidateError {
  /** Provider ID that failed */
  providerId: string;
  /** Model ID that was used (if available) */
  modelId?: string;
  /** The error that occurred */
  error: Error;
  /** Index of the attempt (0-based) */
  attemptIndex: number;
}

/**
 * Thrown when all candidates in a group have failed
 * Contains details about each failure for debugging/logging
 */
export class AllCandidatesFailedError extends Error {
  readonly name = 'AllCandidatesFailedError';

  constructor(public readonly errors: CandidateError[]) {
    super(`All ${errors.length} candidate(s) failed`);
  }
}
