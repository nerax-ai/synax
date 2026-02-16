/**
 * Universal finish reasons for LLM completions.
 */
export type FinishReason =
  | 'stop'
  | 'length'
  | 'tool-calls'
  | 'content-filter'
  | 'sensitive-content'
  | 'error'
  | 'other'
  | null;
