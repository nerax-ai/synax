/**
 * Core type definitions for the language protocol.
 * These types ensure type safety while maintaining flexibility for provider-specific data.
 */

/**
 * Represents a valid JSON primitive value.
 */
export type JSONPrimitive = string | number | boolean | null;

/**
 * Represents a valid JSON value (recursive type).
 */
export type JSONValue = JSONPrimitive | JSONValue[] | { [key: string]: JSONValue };

/**
 * Represents a JSON object (record with string keys).
 */
export type JSONObject = { [key: string]: JSONValue };

/**
 * Represents a JSON Schema definition.
 * Using a simplified type that captures the essential structure.
 */
export interface JSONSchema {
  type?: string | string[];
  properties?: { [key: string]: JSONSchema };
  items?: JSONSchema | JSONSchema[];
  required?: string[];
  enum?: (string | number | boolean | null)[];
  const?: JSONValue;
  default?: JSONValue;
  description?: string;
  format?: string;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  multipleOf?: number;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  additionalProperties?: boolean | JSONSchema;
  $ref?: string;
  definitions?: { [key: string]: JSONSchema };
  $defs?: { [key: string]: JSONSchema };
  allOf?: JSONSchema[];
  anyOf?: JSONSchema[];
  oneOf?: JSONSchema[];
  not?: JSONSchema;
  [key: string]: unknown;
}

/**
 * Provider-specific metadata.
 * Uses unknown for values to encourage type narrowing.
 */
export type ProviderMetadata = Record<string, unknown>;

/**
 * Provider-specific options for requests and tools.
 */
export type ProviderOptions = Record<string, unknown>;
