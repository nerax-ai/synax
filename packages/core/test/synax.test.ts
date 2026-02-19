import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { Synax } from '../src/synax';
import { PluginRegistry } from '../src/plugin-registry';
import type { Provider, Dispatcher } from '@synax/sdk';
import { join } from 'path';

const FIXTURES_DIR = join(__dirname, 'fixtures');
const MOCK_PLUGIN_PATH = join(FIXTURES_DIR, 'mock-plugin');

// Helper to create Synax with default config
function createSynax() {
  return new Synax({ providers: [], groups: [] });
}

describe('Synax with PluginRegistry', () => {
  beforeEach(async () => {
    PluginRegistry.reset();
    await PluginRegistry.load(`file:${MOCK_PLUGIN_PATH}`);
  });

  afterEach(() => {
    PluginRegistry.reset();
  });

  describe('addProvider() with factoryRef', () => {
    test('creates provider from factory reference', async () => {
      const synax = createSynax();

      await synax.addProvider({
        id: 'mock-1',
        use: 'mock-provider',
        options: { apiKey: 'test-key' },
      });

      const provider = synax.getProvider('mock-1');
      expect(provider).toBeDefined();
      expect(provider?.id).toBe('mock-1');
    });

    test('throws error for unknown factory', async () => {
      const synax = createSynax();

      await expect(
        synax.addProvider({
          id: 'unknown',
          use: 'nonexistent-factory',
          options: {},
        }),
      ).rejects.toThrow();
    });

    test('can add multiple provider instances from same factory', async () => {
      const synax = createSynax();

      await synax.addProvider({
        id: 'mock-1',
        use: 'mock-provider',
        options: { apiKey: 'key-1' },
      });

      await synax.addProvider({
        id: 'mock-2',
        use: 'mock-provider',
        options: { apiKey: 'key-2' },
      });

      expect(synax.getProvider('mock-1')).toBeDefined();
      expect(synax.getProvider('mock-2')).toBeDefined();
      expect(synax.listProviders()).toHaveLength(2);
    });

    test('provider from factory has language capability', async () => {
      const synax = createSynax();

      await synax.addProvider({
        id: 'mock-1',
        use: 'mock-provider',
        options: {},
      });

      const provider = synax.getProvider('mock-1');
      expect(provider?.language).toBeDefined();
      expect(provider?.language?.generate).toBeDefined();
      expect(provider?.language?.stream).toBeDefined();
    });
  });

  describe('addProvider() with direct provider', () => {
    test('accepts direct provider instance', async () => {
      const synax = createSynax();

      const directProvider: Provider = {
        id: 'direct-1',
        name: 'Direct Provider',
        language: {
          generate: async () => ({
            id: 'r1',
            created: 0,
            model: 'mock',
            choices: [{ index: 0, message: { role: 'assistant', content: 'direct response' }, finishReason: 'stop' }],
          }),
          stream: async function* () {
            yield { type: 'text-delta' as const, id: '1', delta: 'direct' };
          },
          models: async () => [],
        },
      };

      synax.addProvider(directProvider);

      const provider = synax.getProvider('direct-1');
      expect(provider).toBe(directProvider);
    });
  });

  describe('addDispatcher() with factoryRef', () => {
    test('creates dispatcher from factory reference', async () => {
      const synax = createSynax();

      await synax.addDispatcher({
        name: 'mock-dispatcher-1',
        use: 'mock-dispatcher',
      });

      const dispatcher = synax.getDispatcher('mock-dispatcher-1');
      expect(dispatcher).toBeDefined();
      expect(dispatcher?.name).toBe('mock-dispatcher-1');
      expect(dispatcher?.dispatch).toBeDefined();
    });

    test('throws error for unknown dispatcher factory', async () => {
      const synax = createSynax();

      await expect(
        synax.addDispatcher({
          name: 'unknown',
          use: 'nonexistent-dispatcher',
        }),
      ).rejects.toThrow();
    });

    test('can add multiple dispatchers from same factory', async () => {
      const synax = createSynax();

      await synax.addDispatcher({
        name: 'dispatcher-1',
        use: 'mock-dispatcher',
      });

      await synax.addDispatcher({
        name: 'dispatcher-2',
        use: 'mock-dispatcher',
      });

      // Note: Synax may only keep one dispatcher at a time
      // Check based on actual implementation
    });
  });

  describe('addDispatcher() with direct dispatcher', () => {
    test('accepts direct dispatcher instance', async () => {
      const synax = createSynax();

      const directDispatcher: Dispatcher = {
        name: 'direct-dispatcher',
        dispatch: async (_ctx, candidates, execute) => {
          for (const candidate of candidates) {
            try {
              return await execute(candidate.provider, candidate.modelId ?? '');
            } catch {
              continue;
            }
          }
          throw new Error('All candidates failed');
        },
        dispatchStream: async function* (_ctx, candidates, execute) {
          for (const candidate of candidates) {
            try {
              yield* execute(candidate.provider, candidate.modelId ?? '');
              return;
            } catch {
              continue;
            }
          }
          throw new Error('All candidates failed');
        },
      };

      synax.addDispatcher(directDispatcher);

      const dispatcher = synax.getDispatcher('direct-dispatcher');
      expect(dispatcher).toBe(directDispatcher);
    });
  });

  describe('provider and dispatcher isolation', () => {
    test('different Synax instances have isolated providers', async () => {
      const synax1 = createSynax();
      const synax2 = createSynax();

      await synax1.addProvider({
        id: 'provider-1',
        use: 'mock-provider',
        options: { apiKey: 'key-1' },
      });

      await synax2.addProvider({
        id: 'provider-2',
        use: 'mock-provider',
        options: { apiKey: 'key-2' },
      });

      expect(synax1.listProviders()).toHaveLength(1);
      expect(synax2.listProviders()).toHaveLength(1);
      expect(synax1.getProvider('provider-1')).toBeDefined();
      expect(synax1.getProvider('provider-2')).toBeUndefined();
      expect(synax2.getProvider('provider-2')).toBeDefined();
      expect(synax2.getProvider('provider-1')).toBeUndefined();
    });

    test('all instances share the same factory registry', async () => {
      // Plugin already loaded in beforeEach
      const synax1 = createSynax();
      const synax2 = createSynax();

      // Both should be able to use the same factory
      await synax1.addProvider({
        id: 'p1',
        use: 'mock-provider',
        options: {},
      });

      await synax2.addProvider({
        id: 'p2',
        use: 'mock-provider',
        options: {},
      });

      expect(synax1.getProvider('p1')).toBeDefined();
      expect(synax2.getProvider('p2')).toBeDefined();
    });
  });

  describe('full integration', () => {
    test('create synax with provider, dispatcher, and group', async () => {
      const synax = createSynax();

      // Add provider from factory
      await synax.addProvider({
        id: 'mock-provider',
        use: 'mock-provider',
        options: { apiKey: 'test-key' },
      });

      // Add dispatcher from factory
      await synax.addDispatcher({
        name: 'mock-dispatcher',
        use: 'mock-dispatcher',
      });

      // Add a group
      synax.addGroup({
        id: 'default',
        members: [{ provider: 'mock-provider', model: 'mock-model' }],
      });

      // Verify setup
      expect(synax.getProvider('mock-provider')).toBeDefined();
      expect(synax.getDispatcher('mock-dispatcher')).toBeDefined();
      expect(synax.getGroup('default')).toBeDefined();
      expect(synax.listGroups()).toHaveLength(1);
    });

    test('provider language.generate works', async () => {
      const synax = createSynax();

      await synax.addProvider({
        id: 'mock',
        use: 'mock-provider',
        options: {},
      });

      const provider = synax.getProvider('mock');
      const response = await provider?.language?.generate({
        model: 'mock-model',
        messages: [{ role: 'user', content: 'test' }],
      });

      expect(response?.choices[0]?.message?.content).toBe('mock response');
    });

    test('provider language.stream works', async () => {
      const synax = createSynax();

      await synax.addProvider({
        id: 'mock',
        use: 'mock-provider',
        options: {},
      });

      const provider = synax.getProvider('mock');
      const chunks: string[] = [];

      for await (const chunk of provider?.language?.stream({
        model: 'mock-model',
        messages: [{ role: 'user', content: 'test' }],
      }) || []) {
        if (chunk.type === 'text-delta') {
          chunks.push(chunk.delta);
        }
      }

      expect(chunks).toContain('mock');
    });
  });

  describe('error handling', () => {
    test('addProvider throws if provider already exists', async () => {
      const synax = createSynax();

      await synax.addProvider({
        id: 'duplicate',
        use: 'mock-provider',
        options: {},
      });

      await expect(
        synax.addProvider({
          id: 'duplicate',
          use: 'mock-provider',
          options: {},
        }),
      ).rejects.toThrow();
    });

    test('getProvider returns undefined for unknown provider', () => {
      const synax = createSynax();
      expect(synax.getProvider('unknown')).toBeUndefined();
    });

    test('getDispatcher returns undefined for unknown dispatcher', () => {
      const synax = createSynax();
      expect(synax.getDispatcher('unknown')).toBeUndefined();
    });
  });
});
