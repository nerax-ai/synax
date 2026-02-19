import { getLogger } from '@nerax-ai/logger';
import { PluginRegistry } from '@nerax-ai/plugin';
import type {
  AnyModel,
  ApiPluginFactory,
  Dispatcher,
  Endpoint,
  GroupConfig,
  Logger,
  Metrics,
  Provider,
  ProviderConfig,
} from '@synax-ai/sdk';
import { EmbeddingClient } from './clients/embedding-client';
import { ImageClient } from './clients/image-client';
import { LanguageClient } from './clients/language-client';
import { SpeechClient } from './clients/speech-client';
import { VideoClient } from './clients/video-client';
import { DefaultDispatcher } from './default-dispatcher';
import { DispatcherRunner } from './dispatcher-runner';
import { listModels } from './model-list';

type SynaxExtensionType = 'provider' | 'dispatcher' | 'endpoint' | 'api';
type SynaxFactoryMap = {
  provider: (ctx: any) => Provider | Promise<Provider>;
  dispatcher: (ctx: any) => Dispatcher | Promise<Dispatcher>;
  endpoint: (options: Record<string, unknown>) => Endpoint;
  api: ApiPluginFactory;
};
type SynaxRegistry = PluginRegistry<SynaxExtensionType, SynaxFactoryMap>;

function getRegistry(): SynaxRegistry {
  return PluginRegistry.getInstance<SynaxExtensionType, SynaxFactoryMap>();
}

/** Dispatcher created via plugin factory */
export interface ExtendedDispatcherConfig {
  name: string;
  use: string;
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

  async addProvider(config: Provider | ProviderConfig): Promise<void> {
    if ('use' in config) {
      const merged = config.proxy ? { proxy: config.proxy, ...config.options } : (config.options ?? {});
      const provider = (await getRegistry().create('provider', config.use, config.id, merged)) as Provider;
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
    if ('use' in config) {
      const dispatcher = (await getRegistry().create(
        'dispatcher',
        config.use,
        config.name,
        config.options ?? {},
      )) as Dispatcher;
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
