/**
 * Language Model Types
 */

/**
 * Language model modality type
 */
export type LanguageModelModality = 'text' | 'image' | 'audio' | 'video' | 'pdf' | 'file';

/**
 * Language model pricing
 */
export interface LanguageModelCost {
  /** Input price ($/1M tokens) */
  input: number;
  /** Output price ($/1M tokens) */
  output: number;
  /** Cache read price ($/1M tokens) */
  cacheRead?: number;
  /** Cache write price ($/1M tokens) */
  cacheWrite?: number;
}

/**
 * Language model capabilities
 */
export interface LanguageModelCapabilities {
  /** Supports tool calling */
  tools?: boolean;
  /** Supports streaming output */
  streaming?: boolean;
  /** Supports reasoning */
  reasoning?: boolean;
  /** Supports temperature parameter */
  temperature?: boolean;
  /** Supports structured JSON output */
  jsonSchema?: boolean;
  /** Supports attachment upload */
  attachment?: boolean;
}

/**
 * Language model modalities
 */
export interface LanguageModelModalities {
  /** Input modalities */
  input: LanguageModelModality[];
  /** Output modalities */
  output: LanguageModelModality[];
}

/**
 * Language model limits
 */
export interface LanguageModelLimits {
  /** Context window size */
  context: number;
  /** Max output tokens */
  output: number;
}

/**
 * Language model definition
 */
export interface LanguageModel {
  /** Model ID */
  id: string;
  /** Model name */
  name: string;
  /** Model family */
  family?: string;
  /** Model owner */
  ownedBy?: string;

  /** Token limits */
  limits: LanguageModelLimits;
  /** Model capabilities */
  capabilities?: LanguageModelCapabilities;
  /** Input/Output modalities */
  modalities?: LanguageModelModalities;
  /** Pricing info */
  cost?: LanguageModelCost;
}
