import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { FileConfigStore } from '../src/config-store';
import { unlinkSync, existsSync } from 'fs';

const testPath = './test-config.json';

describe('FileConfigStore', () => {
  let store: FileConfigStore;

  beforeEach(() => {
    if (existsSync(testPath)) unlinkSync(testPath);
    store = new FileConfigStore(testPath);
  });

  afterEach(() => {
    if (existsSync(testPath)) unlinkSync(testPath);
  });

  test('should return empty config when file does not exist', async () => {
    const config = await store.getConfig();
    expect(config).toEqual({ providers: [], groups: [], plugins: [], endpoints: [], api: [] });
  });

  test('should add and retrieve provider', async () => {
    await store.addProvider({ id: 'test', use: 'openai' });
    const config = await store.getConfig();
    expect(config.providers).toHaveLength(1);
    expect(config.providers[0].id).toBe('test');
  });

  test('should update provider', async () => {
    await store.addProvider({ id: 'test', use: 'openai' });
    await store.updateProvider('test', { id: 'test', use: 'anthropic' });
    const config = await store.getConfig();
    expect(config.providers[0].use).toBe('anthropic');
  });

  test('should remove provider', async () => {
    await store.addProvider({ id: 'test', use: 'openai' });
    await store.removeProvider('test');
    const config = await store.getConfig();
    expect(config.providers).toHaveLength(0);
  });
});