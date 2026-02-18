/**
 * Detailed token usage statistics for Language Model requests.
 * Aligned with AI SDK V3 structure.
 */
export interface LanguageTokenUsage {
  /** Input token breakdown */
  inputTokens: {
    /** Total input tokens */
    total: number | undefined;
    /** Non-cached input tokens */
    noCache: number | undefined;
    /** Cached input tokens read */
    cacheRead: number | undefined;
    /** Cached input tokens written */
    cacheWrite: number | undefined;
  };

  /** Output token breakdown */
  outputTokens: {
    /** Total output tokens */
    total: number | undefined;
    /** Reasoning/thinking tokens */
    reasoning: number | undefined;
  };
}
