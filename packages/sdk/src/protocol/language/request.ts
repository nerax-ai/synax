import { LanguageMessage } from './message';
import { LanguageTool } from './tool';
import type { JSONSchema, ProviderOptions } from './types';

/**
 * Reasoning configuration for model calls.
 * Used by models with explicit reasoning/thinking capabilities (e.g., OpenAI o1/o3, DeepSeek R1).
 */
export interface LanguageReasoningConfig {
  /**
   * Whether to enable reasoning.
   */
  enabled?: boolean;

  /**
   * Effort level for reasoning.
   * 'none' / 'minimal' / 'low' / 'medium' / 'high' / 'xhigh' control the depth of CoT.
   * Supports custom levels via string extensibility.
   */
  effort?: 'none' | 'minimal' | 'low' | 'medium' | 'high' | 'xhigh' | (string & {});

  /**
   * Maximum budget of tokens allowed for the reasoning/thinking process.
   * Note: This might represent the dedicated budget (e.g., Anthropic budget_tokens)
   * or the total completion limit including reasoning, depending on the provider mapping.
   */
  maxTokens?: number;
}

/**
 * Tool choice configuration.
 * Controls which (if any) tool is called by the model.
 */
export type LanguageToolChoice = 'auto' | 'none' | 'required' | { type: 'function'; function: { name: string } };

/**
 * Response format configuration for structured output.
 */
export interface LanguageResponseFormat {
  /**
   * The type of response format.
   */
  type: 'text' | 'json-object' | 'json-schema';
  /**
   * The JSON schema for the response (required for 'json-schema').
   */
  schema?: JSONSchema;
  /**
   * Name of the schema (used by some providers).
   */
  name?: string;
  /**
   * Description of the expected output.
   */
  description?: string;
  /**
   * Whether to strictly enforce the schema.
   */
  strict?: boolean;
}

/**
 * Language Model Completion Request.
 * Unified structure for sending prompts to various LLM backends.
 */
export interface LanguageRequest {
  /**
   * The target model ID (e.g., 'gpt-4o', 'claude-3-5-sonnet').
   */
  model: string;

  /**
   * The conversation history or prompt messages.
   */
  messages: LanguageMessage[];

  /**
   * The maximum number of tokens to generate in the completion.
   */
  maxOutputTokens?: number;

  /**
   * Controls randomness: higher values (e.g., 0.8) make output more random,
   * lower values (e.g., 0.2) make it more focused and deterministic.
   */
  temperature?: number;

  /**
   * Nucleus sampling: the model considers the results of the tokens with top_p probability mass.
   */
  topP?: number;

  /**
   * Only sample from the top K options for each subsequent token.
   */
  topK?: number;

  /**
   * Number between -2.0 and 2.0. Positive values penalize new tokens based on
   * whether they appear in the text so far, increasing the model's likelihood to talk about new topics.
   */
  presencePenalty?: number;

  /**
   * Number between -2.0 and 2.0. Positive values penalize new tokens based on
   * their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.
   */
  frequencyPenalty?: number;

  /**
   * Up to 4 sequences where the API will stop generating further tokens.
   */
  stopSequences?: string[];

  /**
   * If specified, the system will make a best effort to sample deterministically.
   */
  seed?: number;

  /**
   * A list of tools the model may call.
   */
  tools?: LanguageTool[];

  /**
   * Controls which (if any) tool is called by the model.
   * 'none' means the model will not call a tool.
   * 'auto' means the model can pick.
   * 'required' means the model must call one or more tools.
   */
  toolChoice?: LanguageToolChoice;

  /**
   * Specifies the format that the model must output.
   * Setting to 'json_object' or 'json_schema' enables structured output.
   */
  responseFormat?: LanguageResponseFormat;

  /**
   * Explicit configuration for reasoning/thinking models.
   */
  reasoning?: LanguageReasoningConfig;

  /**
   * A unique identifier representing your end-user.
   */
  user?: string;

  /**
   * Additional metadata or non-standard parameters for the request.
   */
  extra?: Record<string, unknown>;

  /**
   * Advanced provider-specific options for fine-grained control over the backend.
   */
  providerOptions?: ProviderOptions;

  /**
   * Abort signal for cancelling the operation.
   * Note: This is an object instance and is not serializable.
   */
  abortSignal?: AbortSignal;
}
