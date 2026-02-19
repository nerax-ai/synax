import type { Provider, AnyModel, GroupConfig, Dispatcher, Metrics, Logger } from '@synax-ai/sdk';
import { getLogger } from '@nerax-ai/logger';
import { DispatcherRunner } from './dispatcher-runner';
import { DefaultDispatcher } from './default-dispatcher';
import { listModels } from './model-list';
import { LanguageClient } from './clients/language-client';
import { EmbeddingClient } from './clients/embedding-client';
import { ImageClient } from './clients/image-client';
import { SpeechClient } from './clients/speech-client';
import { VideoClient } from './clients/video-client';
import { PluginRegistry } from './plugin-registry';

/** Provider created via plugin factory */
export interface ExtendedProviderConfig {
  id: string;
  factoryRef: string;
  options?: Record<string, unknown>;
}

/** Dispatcher created via plugin factory */
export interface ExtendedDispatcherConfig {
  name: string;
  factoryRef: string;
  options?: Record<string, unknown>;
}

export interface SynaxConfig {
  appName?: string;
  providers: Provider[];
  groups: GroupConfig[];
  metrics?: Metrics;
  dispatchers?: Dispatcher[];
}

export class Synax {
  private readonly providers: Map<string, Provider> = new Map();
  private readonly groups: Map<string, GroupConfig> = new Map();
  private readonly dispatchers: Map<string, Dispatcher> = new Map();
  private readonly dispatcherRunner: DispatcherRunner;
  private readonly logger: Logger;
  private readonly metrics?: Metrics;

  private _language?: LanguageClient;
  private _embedding?: EmbeddingClient;
  private _image?: ImageClient;
  private _speech?: SpeechClient;
  private _video?: VideoClient;

  constructor(config: SynaxConfig) {
    this.logger = getLogger(config.appName ?? 'synax');
    this.metrics = config.metrics;

    for (const provider of config.providers) {
      this.providers.set(provider.id, provider);
    }
    for (const group of config.groups) {
      this.groups.set(group.id, group);
    }

    this.dispatchers.set('default', new DefaultDispatcher());
    for (const dispatcher of config.dispatchers ?? []) {
      this.dispatchers.set(dispatcher.name, dispatcher);
    }

    this.dispatcherRunner = new DispatcherRunner({
      providers: this.providers,
      groups: this.groups,
      dispatchers: this.dispatchers,
      logger: this.logger,
      metrics: this.metrics,
    });
  }

  async addProvider(config: Provider | ExtendedProviderConfig): Promise<void> {
    if ('factoryRef' in config) {
      const provider = await PluginRegistry.createProvider(config.factoryRef, config.id, config.options ?? {});
      if (this.providers.has(provider.id)) {
        throw new Error(`Provider with id '${provider.id}' already exists`);
      }
      this.providers.set(provider.id, provider);
      return;
    }
    if (this.providers.has(config.id)) {
      throw new Error(`Provider with id '${config.id}' already exists`);
    }
    this.providers.set(config.id, config);
  }

  getProvider(id: string): Provider | undefined {
    return this.providers.get(id);
  }

  listProviders(): Provider[] {
    return Array.from(this.providers.values());
  }

  addGroup(config: GroupConfig): void {
    this.groups.set(config.id, config);
  }

  getGroup(id: string): GroupConfig | undefined {
    return this.groups.get(id);
  }

  listGroups(): GroupConfig[] {
    return Array.from(this.groups.values());
  }

  async addDispatcher(config: Dispatcher | ExtendedDispatcherConfig): Promise<void> {
    if ('factoryRef' in config) {
      const dispatcher = await PluginRegistry.createDispatcher(config.factoryRef, config.name, config.options ?? {});
      this.dispatchers.set(dispatcher.name, dispatcher);
      return;
    }
    this.dispatchers.set(config.name, config);
  }

  getDispatcher(name: string): Dispatcher | undefined {
    return this.dispatchers.get(name);
  }

  listModels(): AnyModel[] {
    return listModels(this.groups, this.providers);
  }

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
