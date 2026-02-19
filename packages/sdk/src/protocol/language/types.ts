export type JSONPrimitive = string | number | boolean | null;
export type JSONValue = JSONPrimitive | JSONValue[] | { [key: string]: JSONValue };
export type JSONObject = { [key: string]: JSONValue };

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

export type ProviderMetadata = Record<string, unknown>;
export type ProviderOptions = Record<string, unknown>;
