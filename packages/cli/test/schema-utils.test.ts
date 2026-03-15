import { describe, test, expect } from 'bun:test';
import { promptSchema } from '../src/schema-utils';
import type { Schema } from '@synax-ai/sdk';

describe('promptSchema', () => {
  test('should return empty object for empty schema', async () => {
    expect(await promptSchema({})).toEqual({});
    expect(await promptSchema({ fields: [] })).toEqual({});
  });
});
