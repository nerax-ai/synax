import { z } from 'zod';
import { messagesSchema } from './schemas';
import type { LanguageMessage } from '@synax-ai/sdk';

export class ValidationError extends Error {
  constructor(message: string, public details?: unknown) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateMessages(messages: unknown): LanguageMessage[] {
  // Schema validation
  const result = messagesSchema.safeParse(messages);
  if (!result.success) {
    throw new ValidationError('Invalid message format', result.error.format());
  }

  const validMessages = result.data as LanguageMessage[];

  // Tool-call sequence validation
  validateToolCallSequence(validMessages);

  return validMessages;
}

function validateToolCallSequence(messages: LanguageMessage[]): void {
  const pendingToolCalls = new Set<string>();

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];

    if (msg.role === 'assistant' && Array.isArray(msg.content)) {
      for (const part of msg.content) {
        if (part.type === 'tool-call') {
          pendingToolCalls.add(part.toolCallId);
        }
      }
    }

    if (msg.role === 'tool' && Array.isArray(msg.content)) {
      for (const part of msg.content) {
        if (part.type === 'tool-result') {
          pendingToolCalls.delete(part.toolCallId);
        }
      }
    }

    if (i < messages.length - 1 && pendingToolCalls.size > 0) {
      const nextMsg = messages[i + 1];
      if (nextMsg.role !== 'tool') {
        throw new ValidationError(
          `Tool calls must be followed by tool results. Missing: ${Array.from(pendingToolCalls).join(', ')}`
        );
      }
    }
  }
}
