import type {
  LanguageTextContent,
  LanguageFileContent,
  LanguageReasoningContent,
  LanguageToolCallContent,
  LanguageToolResultContent,
  LanguageToolApprovalRequestContent,
  LanguageToolApprovalResponseContent,
} from './content';
import type { ProviderMetadata } from './types';

export interface LanguageMessageBase {
  providerMetadata?: ProviderMetadata;
}

/** System message: defines model behavior/persona */
export interface LanguageSystemMessage extends LanguageMessageBase {
  role: 'system';
  content: string;
}

/** User message: supports text and multimodal (image, audio, video, PDF) input */
export interface LanguageUserMessage extends LanguageMessageBase {
  role: 'user';
  content: string | Array<LanguageTextContent | LanguageFileContent>;
}

/** Assistant message: model output including text, reasoning, and tool calls */
export interface LanguageAssistantMessage extends LanguageMessageBase {
  role: 'assistant';
  content:
    | string
    | Array<
        | LanguageTextContent
        | LanguageFileContent
        | LanguageReasoningContent
        | LanguageToolCallContent
        | LanguageToolApprovalRequestContent
      >;
  /** Refusal message from the model (e.g. safety filter triggered) */
  refusal?: string;
}

/** Tool message: results from tool execution, linked to specific tool calls */
export interface LanguageToolMessage extends LanguageMessageBase {
  role: 'tool';
  content: Array<LanguageToolResultContent | LanguageToolApprovalResponseContent>;
}

export type LanguageMessage =
  | LanguageSystemMessage
  | LanguageUserMessage
  | LanguageAssistantMessage
  | LanguageToolMessage;
