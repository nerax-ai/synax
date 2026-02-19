import { LanguageMessagePart } from './content';
import { FinishReason } from './finish-reason';
import { LanguageTokenUsage } from './usage';
import type { ProviderMetadata } from './types';

/**
 * Language Stream Part.
 * Event-based stream parts aligned with AI SDK V3.
 * Each part is a discriminated union member with a 'type' field.
 */
export type LanguageStreamPart =
  // Text blocks
  | { type: 'text-start'; id: string; providerMetadata?: ProviderMetadata }
  | { type: 'text-delta'; id: string; delta: string; providerMetadata?: ProviderMetadata }
  | { type: 'text-end'; id: string; providerMetadata?: ProviderMetadata }

  // Reasoning blocks
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

  // Inline content parts (tool-call, tool-result, file, source, approval)
  | ({ type: 'content-part' } & LanguageMessagePart)

  // Stream lifecycle
  | { type: 'stream-start'; warnings?: string[] }
  | { type: 'response-metadata'; id: string; model: string; created: number }
  | { type: 'finish'; finishReason: FinishReason; usage: LanguageTokenUsage; providerMetadata?: ProviderMetadata }
  | { type: 'error'; error: unknown };
