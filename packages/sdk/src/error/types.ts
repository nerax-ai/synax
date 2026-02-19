/** Base error class for all Synax errors */
export class SynaxError extends Error {
  readonly name = 'SynaxError';

  constructor(
    message: string,
    public readonly code: string,
    /** HTTP-like status code for categorizing the error */
    public readonly statusCode: number = 500,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}

export interface CandidateError {
  providerId: string;
  modelId?: string;
  error: Error;
  attemptIndex: number;
}

/** Thrown when all candidates in a group have failed */
export class AllCandidatesFailedError extends Error {
  readonly name = 'AllCandidatesFailedError';

  constructor(public readonly errors: CandidateError[]) {
    super(`All ${errors.length} candidate(s) failed`);
  }
}
