import { describe, it, expect } from 'bun:test';
import { resolveModel } from '../src/model-resolver';
import type { GroupConfig } from '@synax/sdk';

describe('resolveModel', () => {
  const mockGroups = new Map<string, GroupConfig>([
    [
      'chat',
      {
        id: 'chat',
        members: [{ provider: 'openai', default: 'gpt-4o' }],
      },
    ],
    [
      'embeddings',
      {
        id: 'embeddings',
        members: [{ provider: 'openai', default: 'text-embedding-3-small' }],
      },
    ],
  ]);

  describe('resolve', () => {
    it('should resolve group-id to group without requiredModel', () => {
      const result = resolveModel(mockGroups, 'chat');

      expect(result.groupId).toBe('chat');
      expect(result.group).toBeDefined();
      expect(result.group.id).toBe('chat');
      expect(result.requiredModel).toBeUndefined();
    });

    it('should resolve group-id/model-id with requiredModel', () => {
      const result = resolveModel(mockGroups, 'chat/gpt-4-turbo');

      expect(result.groupId).toBe('chat');
      expect(result.group).toBeDefined();
      expect(result.requiredModel).toBe('gpt-4-turbo');
    });

    it('should throw for unknown group', () => {
      expect(() => resolveModel(mockGroups, 'unknown')).toThrow("Group 'unknown' not found");
    });

    it('should throw for unknown group with model', () => {
      expect(() => resolveModel(mockGroups, 'unknown/model')).toThrow("Group 'unknown' not found");
    });
  });
});
