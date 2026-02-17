import type { ProviderConfig, Provider, AnyModel, GroupConfig, Dispatcher, Logger, Metrics } from '@synax/sdk';
import { DispatcherRunner } from './dispatcher-runner';
import { DefaultDispatcher } from './default-dispatcher';
import { listModels } from './model-list';
import { LanguageClient } from './clients/language-client';
import { EmbeddingClient } from './clients/embedding-client';
import { ImageClient } from './clients/image-client';
import { SpeechClient } from './clients/speech-client';
import { VideoClient } from './clients/video-client';

/**
 * Synax configuration
 */
export interface SynaxConfig {
  providers: ProviderConfig[];
  groups: GroupConfig[];
  /** Logger instance (optional) */
  logger?: Logger;
  /** Metrics instance (optional) */
  metrics?: Metrics;
  /** Custom dispatchers (optional) */
  dispatchers?: Dispatcher[];
}

/**
 * Create provider instance from config
 * TODO: Implement proper provider factory
 */
function createProvider(config: ProviderConfig): Provider {
  // For now, assume the provider is already instantiated
  // In real implementation, this would use a factory pattern
  const provider = config as unknown as Provider;
  // Attach models from config if provider doesn't have them
  if (!provider.models && config.models) {
    Object.defineProperty(provider, 'models', {
      value: config.models,
      writable: false,
      enumerable: true,
    });
  }
  return provider;
}

/**
 * Default console logger
 */
const defaultLogger: Logger = {
  debug: (message, ...args) => console.debug('[Synax]', message, ...args),
  info: (message, ...args) => console.info('[Synax]', message, ...args),
  warn: (message, ...args) => console.warn('[Synax]', message, ...args),
  error: (message, ...args) => console.error('[Synax]', message, ...args),
};

/**
 * Synax - Main Router Class
 *
 * Usage:
 * ```ts
 * const synax = new Synax({
 *   providers: [
 *     { id: 'openai', type: 'openai', apiKey: '...' },
 *     { id: 'anthropic', type: 'anthropic', apiKey: '...' },
 *   ],
 *   groups: [
 *     { id: 'fast', members: [{ provider: 'openai', default: 'gpt-4o-mini' }] },
 *     { id: 'smart', members: [{ provider: 'anthropic', default: 'claude-3.5-sonnet' }] },
 *   ],
 * });
 *
 * await synax.language.generate({ model: 'fast', messages: [...] });
 * await synax.language.stream({ model: 'smart', messages: [...] });
 * ```
 */
export class Synax {
  private readonly providers: Map<string, Provider> = new Map();
  private readonly groups: Map<string, GroupConfig> = new Map();
  private readonly dispatchers: Map<string, Dispatcher> = new Map();
  private readonly dispatcherRunner: DispatcherRunner;
  private readonly logger: Logger;
  private readonly metrics?: Metrics;

  // Sub-clients (lazy initialized)
  private _language?: LanguageClient;
  private _embedding?: EmbeddingClient;
  private _image?: ImageClient;
  private _speech?: SpeechClient;
  private _video?: VideoClient;

  constructor(config: SynaxConfig) {
    this.logger = config.logger ?? defaultLogger;
    this.metrics = config.metrics;

    // Initialize providers
    for (const providerConfig of config.providers) {
      const provider = createProvider(providerConfig);
      this.providers.set(provider.id, provider);
    }

    // Initialize groups
    for (const group of config.groups) {
      this.groups.set(group.id, group);
    }

    // Register default dispatcher first
    this.dispatchers.set('default', new DefaultDispatcher());

    // Initialize dispatchers (custom dispatchers override default)
    for (const dispatcher of config.dispatchers ?? []) {
      this.dispatchers.set(dispatcher.name, dispatcher);
    }

    // Initialize dispatcher runner
    this.dispatcherRunner = new DispatcherRunner({
      providers: this.providers,
      groups: this.groups,
      dispatchers: this.dispatchers,
      logger: this.logger,
      metrics: this.metrics,
    });
  }

  // === Provider management ===

  addProvider(config: ProviderConfig): void {
    const provider = createProvider(config);
    this.providers.set(provider.id, provider);
  }

  getProvider(id: string): Provider | undefined {
    return this.providers.get(id);
  }

  listProviders(): Provider[] {
    return Array.from(this.providers.values());
  }

  // === Group management ===

  addGroup(config: GroupConfig): void {
    this.groups.set(config.id, config);
  }

  getGroup(id: string): GroupConfig | undefined {
    return this.groups.get(id);
  }

  listGroups(): GroupConfig[] {
    return Array.from(this.groups.values());
  }

  // === Dispatcher management ===

  addDispatcher(dispatcher: Dispatcher): void {
    this.dispatchers.set(dispatcher.name, dispatcher);
  }

  getDispatcher(name: string): Dispatcher | undefined {
    return this.dispatchers.get(name);
  }

  // === Model query ===

  listModels(): AnyModel[] {
    return listModels(this.groups, this.providers);
  }

  // === Sub-clients ===

  get language(): LanguageClient {
    return (this._language ??= new LanguageClient(this.dispatcherRunner));
  }

  get embedding(): EmbeddingClient {
    return (this._embedding ??= new EmbeddingClient(this.dispatcherRunner));
  }

  get image(): ImageClient {
    return (this._image ??= new ImageClient(this.dispatcherRunner));
  }

  get speech(): SpeechClient {
    return (this._speech ??= new SpeechClient(this.dispatcherRunner));
  }

  get video(): VideoClient {
    return (this._video ??= new VideoClient(this.dispatcherRunner));
  }
}
