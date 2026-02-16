/**
 * Detailed token usage statistics for Language Model requests.
 */
export interface LanguageTokenUsage {
  /**
   * Number of tokens in the prompt (input).
   */
  promptTokens: number;

  /**
   * Number of tokens in the generated completion (output).
   */
  completionTokens: number;

  /**
   * Sum of prompt and completion tokens.
   */
  totalTokens: number;

  /**
   * Breakdown of prompt tokens.
   */
  promptDetails?: {
    /**
     * Number of prompt tokens that were reused from cache.
     */
    cachedTokens?: number;
    /**
     * Number of tokens related to audio input.
     */
    audioTokens?: number;
  };

  /**
   * Breakdown of completion tokens.
   */
  completionDetails?: {
    /**
     * Number of tokens used for internal reasoning/thinking.
     */
    reasoningTokens?: number;
    /**
     * Number of tokens related to audio output.
     */
    audioTokens?: number;
    /**
     * Number of tokens for accepted speculative predictions.
     */
    acceptedPredictionTokens?: number;
    /**
     * Number of tokens for rejected speculative predictions.
     */
    rejectedPredictionTokens?: number;
  };
}
