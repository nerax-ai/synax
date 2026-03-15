import { PluginRegistry } from '@nerax-ai/plugin';
import { getLogger } from '@nerax-ai/logger';
import type { Schema, SchemaField } from '@nerax-ai/plugin';
import { input, confirm, select, password } from '@inquirer/prompts';

let registry: ReturnType<typeof PluginRegistry.getInstance> | null = null;

export async function getPluginRegistry() {
  if (!registry) {
    registry = PluginRegistry.getInstance({ appName: 'synax', logger: getLogger('synax') });
  }
  return registry;
}

/**
 * Normalized field type for internal processing
 * Accepts both SDK and Plugin schema formats
 */
type NormalizedField = {
  name: string;
  type: 'string' | 'number' | 'boolean';
  label?: string;
  description?: string;
  required?: boolean;
  default?: unknown;
  placeholder?: string;
  secret?: boolean;
  multiline?: boolean;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  step?: number;
  enum?: Array<{ value: string; label: string; description?: string }>;
  condition?: (values: Record<string, unknown>) => boolean;
  validate?: (value: unknown, values: Record<string, unknown>) => string | undefined;
};

/**
 * Normalize schema field from either SDK or Plugin format
 */
function normalizeField(field: any): NormalizedField {
  const normalized: NormalizedField = {
    name: field.name,
    type: field.type || 'string',
    label: field.label || field.name,
    description: field.description,
    required: field.required,
    default: field.default,
    placeholder: field.placeholder,
    secret: field.secret,
    multiline: field.multiline,
    minLength: field.minLength,
    maxLength: field.maxLength,
    minimum: field.minimum,
    maximum: field.maximum,
    step: field.step,
    condition: field.condition,
    validate: field.validate,
  };

  // Handle enum - support both formats
  if (field.enum) {
    if (typeof field.enum[0] === 'string') {
      // Simple string array format
      normalized.enum = field.enum.map((v: string) => ({ value: v, label: v }));
    } else {
      // Object format with value/label
      normalized.enum = field.enum.map((opt: any) => ({
        value: opt.value,
        label: opt.label || opt.value,
        description: opt.description,
      }));
    }
  }

  return normalized;
}

/**
 * Check if a field should be displayed based on condition
 */
function shouldShowField(field: NormalizedField, values: Record<string, unknown>): boolean {
  if (!field.condition) return true;
  try {
    return field.condition(values);
  } catch {
    return true;
  }
}

/**
 * Get the label for a field (prefer label over name)
 */
function getFieldLabel(field: NormalizedField): string {
  return field.label || field.name;
}

/**
 * Prompt for a string field value
 */
async function promptStringField(field: NormalizedField, values: Record<string, unknown>): Promise<unknown> {
  const label = getFieldLabel(field);
  const message = field.description ? `${label} - ${field.description}` : label;

  // Handle enum (select)
  if (field.enum && field.enum.length > 0) {
    const choices = field.enum.map((opt) => ({
      name: opt.label,
      value: opt.value,
      description: opt.description,
    }));

    return select({
      message,
      choices,
      default: field.default as string,
    });
  }

  // Handle secret (password)
  if (field.secret) {
    return password({
      message,
      mask: '*',
      validate: (v) => {
        if (field.required && !v) return `${label} is required`;
        if (field.minLength && v.length < field.minLength) return `Minimum ${field.minLength} characters`;
        if (field.maxLength && v.length > field.maxLength) return `Maximum ${field.maxLength} characters`;
        if (field.validate) {
          const error = field.validate(v, values);
          if (error) return error;
        }
        return true;
      },
    });
  }

  // Regular text input
  const messageWithPlaceholder = field.placeholder
    ? `${message} (${field.placeholder})`
    : message;

  return input({
    message: messageWithPlaceholder,
    default: field.default as string,
    validate: (v) => {
      if (field.required && !v) return `${label} is required`;
      if (field.minLength && v.length < field.minLength) return `Minimum ${field.minLength} characters`;
      if (field.maxLength && v.length > field.maxLength) return `Maximum ${field.maxLength} characters`;
      if (field.validate) {
        const error = field.validate(v, values);
        if (error) return error;
      }
      return true;
    },
  });
}

/**
 * Prompt for a number field value
 */
async function promptNumberField(field: NormalizedField, values: Record<string, unknown>): Promise<unknown> {
  const label = getFieldLabel(field);
  const messageBase = field.description ? `${label} - ${field.description}` : label;
  const message = field.placeholder ? `${messageBase} (${field.placeholder})` : messageBase;

  const answer = await input({
    message,
    default: field.default?.toString(),
    validate: (v) => {
      if (field.required && !v) return `${label} is required`;

      const num = parseFloat(v);
      if (isNaN(num)) return 'Please enter a valid number';
      if (field.minimum !== undefined && num < field.minimum) return `Minimum value is ${field.minimum}`;
      if (field.maximum !== undefined && num > field.maximum) return `Maximum value is ${field.maximum}`;
      if (field.step !== undefined) {
        const decimals = (field.step.toString().split('.')[1] || '').length;
        const rounded = Math.round(num / field.step) * field.step;
        if (Math.abs(num - rounded) > Math.pow(10, -decimals - 1)) {
          return `Value must be a multiple of ${field.step}`;
        }
      }
      if (field.validate) {
        const error = field.validate(num, values);
        if (error) return error;
      }
      return true;
    },
  });

  return parseFloat(answer);
}

/**
 * Prompt for a boolean field value
 */
async function promptBooleanField(field: NormalizedField, values: Record<string, unknown>): Promise<unknown> {
  const label = getFieldLabel(field);
  const message = field.description ? `${label} - ${field.description}` : label;

  const defaultVal = typeof field.default === 'boolean' ? field.default : false;

  return confirm({
    message,
    default: defaultVal,
  });
}

/**
 * Prompt for schema field values in CLI
 * Supports all field types: string, number, boolean
 * Handles enum, secret, condition, validate, and constraints
 */
export async function promptSchema(schema: Schema | undefined): Promise<Record<string, unknown>> {
  if (!schema?.fields) return {};

  const answers: Record<string, unknown> = {};
  const normalizedFields = schema.fields.map(normalizeField);

  // First pass: collect defaults for condition evaluation
  for (const field of normalizedFields) {
    if (field.default !== undefined) {
      answers[field.name] = field.default;
    }
  }

  // Second pass: prompt for each field
  for (const field of normalizedFields) {
    // Check condition
    if (!shouldShowField(field, answers)) {
      continue;
    }

    let value: unknown;

    switch (field.type) {
      case 'number':
        value = await promptNumberField(field, answers);
        break;
      case 'boolean':
        value = await promptBooleanField(field, answers);
        break;
      case 'string':
      default:
        value = await promptStringField(field, answers);
        break;
    }

    answers[field.name] = value;
  }

  return answers;
}
