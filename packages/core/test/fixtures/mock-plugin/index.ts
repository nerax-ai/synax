import type { Provider, Dispatcher } from '@synax-ai/sdk';
import type { PluginModule } from '@nerax-ai/plugin';

type SynaxPluginModule = PluginModule<
  'provider' | 'dispatcher',
  {
    provider: (ctx: any) => Provider | Promise<Provider>;
    dispatcher: (ctx: any) => Dispatcher | Promise<Dispatcher>;
  }
>;

export default {
  manifest: { id: '@test/mock-plugin', name: 'Mock Plugin', version: '1.0.0' },

  setup(ctx) {
    ctx.register(
      'provider',
      'mock-provider',
      async (factoryCtx) => {
        const provider: Provider = {
          id: factoryCtx.instanceId,
          name: 'Mock Provider',
          language: {
            generate: async () => ({
              id: 'mock',
              created: 0,
              model: 'mock',
              choices: [{ index: 0, message: { role: 'assistant', content: 'mock response' }, finishReason: 'stop' }],
            }),
            stream: async function* () {
              yield { type: 'text-delta', id: '1', delta: 'mock' };
            },
            models: async () => [],
          },
        };
        return provider;
      },
      { displayName: 'Mock Provider', defaultOptions: { apiKey: 'default-key' } },
    );

    ctx.register(
      'dispatcher',
      'mock-dispatcher',
      async (factoryCtx) => {
        const dispatcher: Dispatcher = {
          name: factoryCtx.instanceId,
          dispatch: async (_ctx, candidates, execute) => {
            for (const c of candidates) {
              try {
                return await execute(c.provider, c.modelId ?? '');
              } catch {
                continue;
              }
            }
            throw new Error('All candidates failed');
          },
          dispatchStream: async function* (_ctx, candidates, execute) {
            for (const c of candidates) {
              try {
                yield* execute(c.provider, c.modelId ?? '');
                return;
              } catch {
                continue;
              }
            }
            throw new Error('All candidates failed');
          },
        };
        return dispatcher;
      },
      { displayName: 'Mock Dispatcher' },
    );
  },
} satisfies SynaxPluginModule;
