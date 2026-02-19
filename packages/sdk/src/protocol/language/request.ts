import type { LanguageMessage } from './message';
import type { LanguageTool } from './tool';
import type { JSONSchema, ProviderOptions } from './types';

export interface LanguageReasoningConfig {
  enabled?: boolean;
  /** Effort level: 'none' / 'minimal' / 'low' / 'medium' / 'high' / 'xhigh' */
  effort?: 'none' | 'minimal' | 'low' | 'medium' | 'high' | 'xhigh' | (string & {});
  /** Max token budget for the reasoning/thinking process */
  maxTokens?: number;
}

/** Controls which tool (if any) the model calls */
export type LanguageToolChoice = 'auto' | 'none' | 'required' | { type: 'function'; function: { name: string } };

/** Specifies the format the model must output */
export interface LanguageResponseFormat {
  type: 'text' | 'json-object' | 'json-schema';
  /** Required when type is 'json-schema' */
  schema?: JSONSchema;
  name?: string;
  description?: string;
  strict?: boolean;
}

export interface LanguageRequest {
  /** Target model ID, e.g. 'default' or 'default/claude-sonnet-4-6' */
  model: string;
  messages: LanguageMessage[];
  maxOutputTokens?: number;
  /** Controls randomness: higher = more random, lower = more deterministic */
  temperature?: number;
  /** Nucleus sampling: model considers tokens with top_p probability mass */
  topP?: number;
  topK?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  stopSequences?: string[];
  seed?: number;
  tools?: LanguageTool[];
  toolChoice?: LanguageToolChoice;
  responseFormat?: LanguageResponseFormat;
  reasoning?: LanguageReasoningConfig;
  user?: string;
  /** Non-standard parameters passed through to the provider */
  extra?: Record<string, unknown>;
  providerOptions?: ProviderOptions;
  abortSignal?: AbortSignal;
}
