/**
 * Tool definitions used for function calling and provider-side tools.
 * Aligned with AI SDK V3 specifications for seamless integration.
 */

import type { JSONSchema, ProviderOptions } from './types';

/**
 * A standard function-calling tool.
 * Follows the flattened V3 structure.
 */
export interface LanguageFunctionTool {
  type: 'function';

  /**
   * The name of the function to be called.
   */
  name: string;

  /**
   * A description of what the function does, used by the model to determine
   * when and how to call the function.
   */
  description?: string;

  /**
   * The parameters the functions accepts, described as a JSON Schema object.
   * Aligned with V3 'inputSchema' naming.
   */
  inputSchema?: JSONSchema;

  /**
   * Whether to enable strict schema matching for the function's arguments.
   */
  strict?: boolean;

  /**
   * Whether this tool requires explicit user approval before execution.
   * This allows the protocol to negotiate 'Human-in-the-loop' flows.
   */
  approval?: boolean;

  /**
   * Additional provider-specific options for the tool.
   */
  providerOptions?: ProviderOptions;
}

/**
 * A tool that is executed directly by the AI provider (e.g., Google Search).
 */
export interface LanguageProviderTool {
  type: 'provider';
  /**
   * Unique ID for the provider tool (e.g., "google_search").
   */
  id: string;
  /**
   * Name of the tool.
   */
  name: string;
  /**
   * Initialization arguments for the provider tool.
   */
  args?: Record<string, unknown>;
}

/**
 * Union type for available tool types.
 */
export type LanguageTool = LanguageFunctionTool | LanguageProviderTool;
