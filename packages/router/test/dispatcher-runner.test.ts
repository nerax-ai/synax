import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { DispatcherRunner } from '../src/dispatcher-runner';
import { DefaultDispatcher } from '../src/default-dispatcher';
import type {
  Provider,
  GroupConfig,
  Dispatcher,
  Logger,
  Metrics,
} from '@synax/sdk';
import { AllCandidatesFailedError } from '@synax/sdk';

// ============================================================
// Mock Helpers
// ============================================================

const createMockLogger = (): Logger => ({
  debug: mock(() => {}),
  info: mock(() => {}),
  warn: mock(() => {}),
  error: mock(() => {}),
});

const createMockMetrics = (): Metrics => ({
  getLatency: mock(() => 100),
  getErrorRate: mock(() => 0),
  isHealthy: mock(() => true),
  recordResult: mock(() => {}),
});

const createMockProvider = (id: string, caps?: Partial<Provider>): Provider => ({
  id,
  name: id,
  language: caps?.language,
  embedding: caps?.embedding,
  image: caps?.image,
  speech: caps?.speech,
  video: caps?.video,
});

// ============================================================
// DispatcherRunner Tests
// ============================================================

describe('DispatcherRunner', () => {
  let runner: DispatcherRunner;
  let providers: Map<string, Provider>;
  let groups: Map<string, GroupConfig>;
  let dispatchers: Map<string, Dispatcher>;
  let logger: Logger;
  let metrics: Metrics;

  beforeEach(() => {
    logger = createMockLogger();
    metrics = createMockMetrics();
    providers = new Map();
    groups = new Map();
    dispatchers = new Map();

    // Register default dispatcher
    const defaultDispatcher = new DefaultDispatcher();
    dispatchers.set(defaultDispatcher.name, defaultDispatcher);

    runner = new DispatcherRunner({
      providers,
      groups,
      dispatchers,
      logger,
      metrics,
    });
  });

  describe('dispatch', () => {
    it('should execute successfully with single provider', async () => {
      const provider = createMockProvider('openai');
      providers.set('openai', provider);

      groups.set('chat', {
        id: 'chat',
        members: [{ provider: 'openai', model: 'gpt-4' }],
      });

      const result = await runner.dispatch('chat', 'language', async (p, model) => {
        expect(p.id).toBe('openai');
        expect(model).toBe('gpt-4');
        return { success: true };
      });

      expect(result).toEqual({ success: true });
    });

    it('should failover to second provider when first fails', async () => {
      const provider1 = createMockProvider('openai');
      const provider2 = createMockProvider('anthropic');
      providers.set('openai', provider1);
      providers.set('anthropic', provider2);

      groups.set('chat', {
        id: 'chat',
        members: [
          { provider: 'openai', model: 'gpt-4' },
          { provider: 'anthropic', model: 'claude-3' },
        ],
      });

      let callCount = 0;
      const result = await runner.dispatch('chat', 'language', async (p, model) => {
        callCount++;
        if (p.id === 'openai') {
          throw new Error('OpenAI failed');
        }
        return { provider: p.id, model };
      });

      expect(callCount).toBe(2);
      expect(result).toEqual({ provider: 'anthropic', model: 'claude-3' });
    });

    it('should throw AllCandidatesFailedError when all providers fail', async () => {
      const provider1 = createMockProvider('openai');
      const provider2 = createMockProvider('anthropic');
      providers.set('openai', provider1);
      providers.set('anthropic', provider2);

      groups.set('chat', {
        id: 'chat',
        members: [
          { provider: 'openai', model: 'gpt-4' },
          { provider: 'anthropic', model: 'claude-3' },
        ],
      });

      await expect(
        runner.dispatch('chat', 'language', async () => {
          throw new Error('Provider failed');
        }),
      ).rejects.toThrow(AllCandidatesFailedError);
    });

    it('should collect all errors in AllCandidatesFailedError', async () => {
      const provider1 = createMockProvider('openai');
      const provider2 = createMockProvider('anthropic');
      providers.set('openai', provider1);
      providers.set('anthropic', provider2);

      groups.set('chat', {
        id: 'chat',
        members: [
          { provider: 'openai', model: 'gpt-4' },
          { provider: 'anthropic', model: 'claude-3' },
        ],
      });

      try {
        await runner.dispatch('chat', 'language', async (p) => {
          throw new Error(`${p.id} error`);
        });
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(AllCandidatesFailedError);
        const failedError = err as AllCandidatesFailedError;
        expect(failedError.errors).toHaveLength(2);
        expect(failedError.errors[0].providerId).toBe('openai');
        expect(failedError.errors[0].error.message).toBe('openai error');
        expect(failedError.errors[1].providerId).toBe('anthropic');
        expect(failedError.errors[1].error.message).toBe('anthropic error');
      }
    });

    it('should filter providers by required model', async () => {
      const provider1 = createMockProvider('openai');
      const provider2 = createMockProvider('anthropic');
      providers.set('openai', provider1);
      providers.set('anthropic', provider2);

      groups.set('chat', {
        id: 'chat',
        members: [
          { provider: 'openai', model: 'gpt-4' },
          { provider: 'anthropic', model: 'claude-3' },
        ],
      });

      const executedProviders: string[] = [];
      await runner.dispatch('chat/gpt-4', 'language', async (p, model) => {
        executedProviders.push(p.id);
        expect(model).toBe('gpt-4');
        return { success: true };
      });

      // Only openai should be tried (matches gpt-4)
      expect(executedProviders).toEqual(['openai']);
    });

    it('should throw error when no providers in group', async () => {
      groups.set('empty', {
        id: 'empty',
        members: [],
      });

      await expect(runner.dispatch('empty', 'language', async () => ({ success: true }))).rejects.toThrow(
        'No valid providers in group: empty',
      );
    });

    it('should throw error when provider not found', async () => {
      groups.set('chat', {
        id: 'chat',
        members: [{ provider: 'nonexistent', model: 'gpt-4' }],
      });

      await expect(runner.dispatch('chat', 'language', async () => ({ success: true }))).rejects.toThrow(
        'No valid providers in group: chat',
      );
    });

    it('should use custom dispatcher when configured', async () => {
      const provider = createMockProvider('openai');
      providers.set('openai', provider);

      groups.set('chat', {
        id: 'chat',
        use: 'custom-dispatcher',
        members: [{ provider: 'openai', model: 'gpt-4' }],
      });

      const customDispatcher: Dispatcher = {
        name: 'custom-dispatcher',
        dispatch: mock(() => Promise.resolve({ custom: true })),
        dispatchStream: mock(() => {}),
      };
      dispatchers.set('custom-dispatcher', customDispatcher);

      const result = await runner.dispatch('chat', 'language', async () => ({ success: true }));

      expect(result).toEqual({ custom: true });
      expect(customDispatcher.dispatch).toHaveBeenCalled();
    });
  });

  describe('dispatchStream', () => {
    it('should yield all chunks from successful stream', async () => {
      const provider = createMockProvider('openai');
      providers.set('openai', provider);

      groups.set('chat', {
        id: 'chat',
        members: [{ provider: 'openai', model: 'gpt-4' }],
      });

      async function* streamGenerator() {
        yield { chunk: 1 };
        yield { chunk: 2 };
        yield { chunk: 3 };
      }

      const chunks: number[] = [];
      for await (const chunk of runner.dispatchStream('chat', 'language', streamGenerator)) {
        chunks.push((chunk as { chunk: number }).chunk);
      }

      expect(chunks).toEqual([1, 2, 3]);
    });

    it('should failover to second provider when stream fails', async () => {
      const provider1 = createMockProvider('openai');
      const provider2 = createMockProvider('anthropic');
      providers.set('openai', provider1);
      providers.set('anthropic', provider2);

      groups.set('chat', {
        id: 'chat',
        members: [
          { provider: 'openai', model: 'gpt-4' },
          { provider: 'anthropic', model: 'claude-3' },
        ],
      });

      let attemptCount = 0;

      async function* streamGenerator(p: Provider) {
        attemptCount++;
        if (p.id === 'openai') {
          throw new Error('Stream failed');
        }
        yield { provider: p.id };
      }

      const chunks: unknown[] = [];
      for await (const chunk of runner.dispatchStream('chat', 'language', streamGenerator)) {
        chunks.push(chunk);
      }

      expect(attemptCount).toBe(2);
      expect(chunks).toEqual([{ provider: 'anthropic' }]);
    });

    it('should throw AllCandidatesFailedError when all streams fail', async () => {
      const provider = createMockProvider('openai');
      providers.set('openai', provider);

      groups.set('chat', {
        id: 'chat',
        members: [{ provider: 'openai', model: 'gpt-4' }],
      });

      async function* failingStream() {
        throw new Error('Stream failed');
      }

      await expect(
        (async () => {
          for await (const _ of runner.dispatchStream('chat', 'language', failingStream)) {
            // consume stream
          }
        })(),
      ).rejects.toThrow(AllCandidatesFailedError);
    });
  });
});
