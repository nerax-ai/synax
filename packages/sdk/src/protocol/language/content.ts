import type { JSONValue, ProviderMetadata } from './types';

/** Structured output from a tool execution */
export type LanguageToolResultOutput =
  | { type: 'text'; value: string }
  | { type: 'json'; value: JSONValue }
  | { type: 'error-text'; value: string }
  | { type: 'error-json'; value: JSONValue }
  | { type: 'execution-denied'; reason?: string }
  | { type: 'content'; value: LanguageMessagePart[] };

export interface LanguageContentPartBase {
  providerMetadata?: ProviderMetadata;
}

export interface LanguageTextContent extends LanguageContentPartBase {
  type: 'text';
  text: string;
  cacheControl?: { type?: string };
}

/** File content part (PDF, Audio, Video, Image) */
export interface LanguageFileContent extends LanguageContentPartBase {
  type: 'file';
  /** Base64 string, binary data, or URL */
  data: string | Uint8Array | URL;
  /** IANA media type, e.g. 'image/png', 'audio/mp3', 'application/pdf' */
  mediaType: string;
  name?: string;
  cacheControl?: { type?: string };
}

/** Reasoning/Thinking content part (Chain of Thought) */
export interface LanguageReasoningContent extends LanguageContentPartBase {
  type: 'reasoning';
  reasoning: string;
  signature?: string;
}

export interface LanguageToolCallContent extends LanguageContentPartBase {
  type: 'tool-call';
  toolCallId: string;
  toolName: string;
  /** Stringified JSON or parsed object */
  input: string | unknown;
  /** Whether the tool is executed by the provider (e.g. MCP, server-side) */
  providerExecuted?: boolean;
  dynamic?: boolean;
}

export interface LanguageToolResultContent extends LanguageContentPartBase {
  type: 'tool-result';
  toolCallId: string;
  toolName: string;
  result: LanguageToolResultOutput;
  isError?: boolean;
  /** Preliminary result to be replaced by its final version */
  preliminary?: boolean;
  dynamic?: boolean;
}

/** Approval request emitted by a provider for a provider-executed tool call */
export interface LanguageToolApprovalRequestContent extends LanguageContentPartBase {
  type: 'tool-approval-request';
  approvalId: string;
  toolCallId: string;
}

/** User's approval decision for a provider-executed tool call */
export interface LanguageToolApprovalResponseContent extends LanguageContentPartBase {
  type: 'tool-approval-response';
  approvalId: string;
  approved: boolean;
  reason?: string;
}

/** Source or citation content part */
export interface LanguageSourceContent extends LanguageContentPartBase {
  type: 'source';
  sourceId: string;
  sourceName?: string;
  uri?: string;
  title?: string;
  text?: string;
}

export type LanguageMessagePart =
  | LanguageTextContent
  | LanguageFileContent
  | LanguageReasoningContent
  | LanguageToolCallContent
  | LanguageToolResultContent
  | LanguageToolApprovalRequestContent
  | LanguageToolApprovalResponseContent
  | LanguageSourceContent;
