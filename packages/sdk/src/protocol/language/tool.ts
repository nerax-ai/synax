import type { JSONSchema, ProviderOptions } from './types';

export interface LanguageFunctionTool {
  type: 'function';
  name: string;
  description?: string;
  /** Parameters the function accepts, described as a JSON Schema object */
  inputSchema?: JSONSchema;
  strict?: boolean;
  /** Whether this tool requires explicit user approval before execution */
  approval?: boolean;
  providerOptions?: ProviderOptions;
}

/** A tool executed directly by the AI provider (e.g., Google Search, code interpreter) */
export interface LanguageProviderTool {
  type: 'provider';
  /** Unique ID for the provider tool, e.g. "google_search" */
  id: string;
  name: string;
  /** Initialization arguments for the provider tool */
  args?: Record<string, unknown>;
}

export type LanguageTool = LanguageFunctionTool | LanguageProviderTool;
