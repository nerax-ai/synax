import type { LanguageRequest, LanguageResponse, LanguageStreamChunk, LanguageModel } from '../protocol/language';

/**
 * Language model capability interface
 */
export interface LanguageCapability {
  /**
   * Generate response (non-streaming)
   */
  generate(request: LanguageRequest): Promise<LanguageResponse>;

  /**
   * Stream response
   */
  stream(request: LanguageRequest): AsyncGenerator<LanguageStreamChunk, void, unknown>;

  /**
   * Get supported model list
   */
  models(): Promise<LanguageModel[]>;
}
