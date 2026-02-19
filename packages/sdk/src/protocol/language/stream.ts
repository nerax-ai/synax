import type { LanguageMessagePart } from './content';
import type { FinishReason } from './finish-reason';
import type { LanguageTokenUsage } from './usage';
import type { ProviderMetadata } from './types';

export type LanguageStreamPart =
  // Text blocks
  | { type: 'text-start'; id: string; providerMetadata?: ProviderMetadata }
  | { type: 'text-delta'; id: string; delta: string; providerMetadata?: ProviderMetadata }
  | { type: 'text-end'; id: string; providerMetadata?: ProviderMetadata }

  // Reasoning/thinking blocks
  | { type: 'reasoning-start'; id: string; providerMetadata?: ProviderMetadata }
  | { type: 'reasoning-delta'; id: string; delta: string; providerMetadata?: ProviderMetadata }
  | { type: 'reasoning-end'; id: string; providerMetadata?: ProviderMetadata }

  // Tool call blocks
  | {
      type: 'tool-input-start';
      id: string;
      toolName: string;
      providerExecuted?: boolean;
      dynamic?: boolean;
      providerMetadata?: ProviderMetadata;
    }
  | { type: 'tool-input-delta'; id: string; delta: string; providerMetadata?: ProviderMetadata }
  | { type: 'tool-input-end'; id: string; providerMetadata?: ProviderMetadata }

  // Inline content parts (tool-result, file, source, approval)
  | ({ type: 'content-part' } & LanguageMessagePart)

  // Stream lifecycle
  | { type: 'stream-start'; warnings?: string[] }
  | { type: 'response-metadata'; id: string; model: string; created: number }
  | { type: 'finish'; finishReason: FinishReason; usage: LanguageTokenUsage; providerMetadata?: ProviderMetadata }
  | { type: 'error'; error: unknown };
