import { z } from 'zod';

// Content part schemas
const textContentSchema = z.object({
  type: z.literal('text'),
  text: z.string(),
  cacheControl: z.object({ type: z.string().optional() }).optional(),
  providerMetadata: z.record(z.unknown()).optional(),
});

const fileContentSchema = z.object({
  type: z.literal('file'),
  data: z.union([z.string(), z.instanceof(Uint8Array), z.instanceof(URL)]),
  mediaType: z.string(),
  name: z.string().optional(),
  cacheControl: z.object({ type: z.string().optional() }).optional(),
  providerMetadata: z.record(z.unknown()).optional(),
});

const reasoningContentSchema = z.object({
  type: z.literal('reasoning'),
  reasoning: z.string(),
  signature: z.string().optional(),
  providerMetadata: z.record(z.unknown()).optional(),
});

const toolCallContentSchema = z.object({
  type: z.literal('tool-call'),
  toolCallId: z.string(),
  toolName: z.string(),
  input: z.union([z.string(), z.unknown()]),
  providerExecuted: z.boolean().optional(),
  dynamic: z.boolean().optional(),
  providerMetadata: z.record(z.unknown()).optional(),
});

const toolResultOutputSchema = z.union([
  z.object({ type: z.literal('text'), value: z.string() }),
  z.object({ type: z.literal('json'), value: z.unknown() }),
  z.object({ type: z.literal('error-text'), value: z.string() }),
  z.object({ type: z.literal('error-json'), value: z.unknown() }),
  z.object({ type: z.literal('execution-denied'), reason: z.string().optional() }),
  z.object({ type: z.literal('content'), value: z.array(z.unknown()) }),
]);

const toolResultContentSchema = z.object({
  type: z.literal('tool-result'),
  toolCallId: z.string(),
  toolName: z.string(),
  output: toolResultOutputSchema,
  isError: z.boolean().optional(),
  preliminary: z.boolean().optional(),
  dynamic: z.boolean().optional(),
  providerMetadata: z.record(z.unknown()).optional(),
});

const toolApprovalRequestSchema = z.object({
  type: z.literal('tool-approval-request'),
  approvalId: z.string(),
  toolCallId: z.string(),
  providerMetadata: z.record(z.unknown()).optional(),
});

const toolApprovalResponseSchema = z.object({
  type: z.literal('tool-approval-response'),
  approvalId: z.string(),
  approved: z.boolean(),
  reason: z.string().optional(),
  providerMetadata: z.record(z.unknown()).optional(),
});

// Message schemas
const systemMessageSchema = z.object({
  role: z.literal('system'),
  content: z.string(),
  providerMetadata: z.record(z.unknown()).optional(),
});

const userMessageSchema = z.object({
  role: z.literal('user'),
  content: z.array(z.union([textContentSchema, fileContentSchema])),
  providerMetadata: z.record(z.unknown()).optional(),
});

const assistantMessageSchema = z.object({
  role: z.literal('assistant'),
  content: z.array(
    z.union([
      textContentSchema,
      fileContentSchema,
      reasoningContentSchema,
      toolCallContentSchema,
      toolApprovalRequestSchema,
    ])
  ),
  refusal: z.string().optional(),
  providerMetadata: z.record(z.unknown()).optional(),
});

const toolMessageSchema = z.object({
  role: z.literal('tool'),
  content: z.array(z.union([toolResultContentSchema, toolApprovalResponseSchema])),
  providerMetadata: z.record(z.unknown()).optional(),
});

export const messageSchema = z.union([
  systemMessageSchema,
  userMessageSchema,
  assistantMessageSchema,
  toolMessageSchema,
]);

export const messagesSchema = z.array(messageSchema).min(1);


