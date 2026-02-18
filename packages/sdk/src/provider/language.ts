import type { LanguageRequest, LanguageResponse, LanguageStreamPart, LanguageModel } from '../protocol/language';

/**
 * Language model capability interface
 */
export interface LanguageCapability {
  generate(request: LanguageRequest): Promise<LanguageResponse>;
  stream(request: LanguageRequest): AsyncGenerator<LanguageStreamPart, void, unknown>;
  models(): Promise<LanguageModel[]>;
}
