import type { Logger, Provider, Dispatcher } from '@synax-ai/sdk';
import type { PluginStorage, PluginModule, InlinePlugin } from '@nerax-ai/plugin';
import { PluginRegistry as BaseRegistry } from '@nerax-ai/plugin';
export type { PluginRegistryConfig } from '@nerax-ai/plugin';

export type SynaxExtensionType = 'provider' | 'dispatcher';

export type SynaxFactoryContext = {
  instanceId: string;
  options: Record<string, unknown>;
  logger: Logger;
  storage: PluginStorage;
};

export type SynaxFactoryMap = {
  provider: (ctx: SynaxFactoryContext) => Provider | Promise<Provider>;
  dispatcher: (ctx: SynaxFactoryContext) => Dispatcher | Promise<Dispatcher>;
};

export type SynaxPluginModule = PluginModule<SynaxExtensionType, SynaxFactoryMap>;
export type SynaxInlinePlugin = InlinePlugin<SynaxExtensionType, SynaxFactoryMap>;
export type SynaxExtension = import('@nerax-ai/plugin').Extension<SynaxExtensionType, SynaxFactoryMap>;

type SynaxBase = BaseRegistry<SynaxExtensionType, SynaxFactoryMap>;

export class PluginRegistry {
  static getInstance(): SynaxBase {
    return BaseRegistry.getInstance<SynaxExtensionType, SynaxFactoryMap>();
  }

  static reset(): void {
    BaseRegistry.reset();
  }

  static load(source: string): Promise<void> {
    return PluginRegistry.getInstance().load(source);
  }

  static register(plugin: SynaxInlinePlugin): void {
    PluginRegistry.getInstance().register(plugin);
  }

  static hasExtension(ref: string): boolean {
    return PluginRegistry.getInstance().hasExtension(ref);
  }

  static listExtensions(type?: SynaxExtensionType): SynaxExtension[] {
    return PluginRegistry.getInstance().listExtensions(type);
  }

  static async createProvider(
    ref: string,
    instanceId: string,
    options: Record<string, unknown> = {},
  ): Promise<Provider> {
    return PluginRegistry.getInstance().create('provider', ref, instanceId, options) as Promise<Provider>;
  }

  static async createDispatcher(
    ref: string,
    instanceId: string,
    options: Record<string, unknown> = {},
  ): Promise<Dispatcher> {
    return PluginRegistry.getInstance().create('dispatcher', ref, instanceId, options) as Promise<Dispatcher>;
  }
}
