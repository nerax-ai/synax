import { describe, test, expect } from 'bun:test';
import { SynaxError, AllCandidatesFailedError, type CandidateError } from '../src/error';

describe('SynaxError', () => {
  test('creates error with message and code', () => {
    const err = new SynaxError('Something went wrong', 'ERR_TEST');
    expect(err.message).toBe('Something went wrong');
    expect(err.code).toBe('ERR_TEST');
    expect(err.name).toBe('SynaxError');
    expect(err.statusCode).toBe(500);
  });

  test('accepts custom status code', () => {
    const err = new SynaxError('Not found', 'ERR_NOT_FOUND', 404);
    expect(err.statusCode).toBe(404);
  });

  test('accepts cause option', () => {
    const cause = new Error('Original error');
    const err = new SynaxError('Wrapped', 'ERR_WRAP', 500, { cause });
    expect(err.cause).toBe(cause);
  });

  test('is instance of Error', () => {
    const err = new SynaxError('test', 'ERR');
    expect(err).toBeInstanceOf(Error);
  });
});

describe('AllCandidatesFailedError', () => {
  test('creates error with candidate errors', () => {
    const errors: CandidateError[] = [
      { providerId: 'openai', modelId: 'gpt-4', error: new Error('Rate limit'), attemptIndex: 0 },
      { providerId: 'anthropic', modelId: 'claude-3', error: new Error('Timeout'), attemptIndex: 1 },
    ];
    const err = new AllCandidatesFailedError(errors);
    expect(err.message).toBe('All 2 candidate(s) failed');
    expect(err.name).toBe('AllCandidatesFailedError');
    expect(err.errors).toHaveLength(2);
  });

  test('handles single error', () => {
    const errors: CandidateError[] = [{ providerId: 'openai', error: new Error('Failed'), attemptIndex: 0 }];
    const err = new AllCandidatesFailedError(errors);
    expect(err.message).toBe('All 1 candidate(s) failed');
    expect(err.errors[0].providerId).toBe('openai');
    expect(err.errors[0].modelId).toBeUndefined();
  });

  test('preserves error details', () => {
    const originalError = new Error('Connection refused');
    const errors: CandidateError[] = [{ providerId: 'local', modelId: 'llama', error: originalError, attemptIndex: 0 }];
    const err = new AllCandidatesFailedError(errors);
    expect(err.errors[0].error).toBe(originalError);
    expect(err.errors[0].attemptIndex).toBe(0);
  });

  test('is instance of Error', () => {
    const err = new AllCandidatesFailedError([]);
    expect(err).toBeInstanceOf(Error);
  });
});
