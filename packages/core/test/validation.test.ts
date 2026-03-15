import { describe, it, expect } from 'bun:test';
import { validateMessages, ValidationError } from '../src/validation';
import type { LanguageMessage } from '@synax-ai/sdk';

describe('validateMessages', () => {
  it('should accept valid messages', () => {
    const messages: LanguageMessage[] = [
      { role: 'user', content: [{ type: 'text', text: 'Hello' }] },
      { role: 'assistant', content: [{ type: 'text', text: 'Hi' }] },
    ];
    expect(() => validateMessages(messages)).not.toThrow();
  });

  it('should reject empty array', () => {
    expect(() => validateMessages([])).toThrow(ValidationError);
  });

  it('should reject invalid message structure', () => {
    expect(() => validateMessages([{ role: 'user', content: 'string' }])).toThrow();
  });

  it('should reject tool-call without tool-result', () => {
    const messages: LanguageMessage[] = [
      { role: 'user', content: [{ type: 'text', text: 'Hello' }] },
      {
        role: 'assistant',
        content: [{ type: 'tool-call', toolCallId: 'call_1', toolName: 'test', input: {} }],
      },
      { role: 'user', content: [{ type: 'text', text: 'Next' }] },
    ];
    expect(() => validateMessages(messages)).toThrow('must be followed by tool results');
  });

  it('should accept tool-call with tool-result', () => {
    const messages: LanguageMessage[] = [
      { role: 'user', content: [{ type: 'text', text: 'Hello' }] },
      {
        role: 'assistant',
        content: [{ type: 'tool-call', toolCallId: 'call_1', toolName: 'test', input: {} }],
      },
      {
        role: 'tool',
        content: [
          {
            type: 'tool-result',
            toolCallId: 'call_1',
            toolName: 'test',
            output: { type: 'text', value: 'result' },
          },
        ],
      },
    ];
    expect(() => validateMessages(messages)).not.toThrow();
  });
});
