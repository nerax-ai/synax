import type { LanguageAssistantMessage } from './message';
import type { FinishReason } from './finish-reason';
import type { LanguageTokenUsage } from './usage';
import type { ProviderMetadata } from './types';

export interface LanguageResponse {
  /** Unique completion ID */
  id: string;
  /** Unix timestamp (seconds) of when the completion was created */
  created: number;
  /** Model ID used for generation */
  model: string;
  choices: Array<{
    index: number;
    message: LanguageAssistantMessage;
    finishReason: FinishReason;
  }>;
  usage?: LanguageTokenUsage;
  providerMetadata?: ProviderMetadata;
}
