import type { ProviderConfig, GroupConfig } from '@synax-ai/sdk';

export interface EndpointConfig {
  use: string;
  basePath?: string;
  options?: Record<string, unknown>;
}

export interface ServerConfig {
  appName?: string;
  plugins?: string[];
  providers?: ProviderConfig[];
  groups?: GroupConfig[];
  endpoints?: EndpointConfig[];
  api?: EndpointConfig[];
}

export interface ConfigStore {
  getConfig(): Promise<ServerConfig>;
  updateConfig(config: ServerConfig): Promise<void>;
  addProvider(provider: ProviderConfig): Promise<void>;
  updateProvider(id: string, provider: ProviderConfig): Promise<boolean>;
  removeProvider(id: string): Promise<boolean>;
  addGroup(group: GroupConfig): Promise<void>;
  updateGroup(id: string, group: GroupConfig): Promise<boolean>;
  removeGroup(id: string): Promise<boolean>;
  addEndpoint(endpoint: EndpointConfig): Promise<void>;
  removeEndpoint(use: string): Promise<boolean>;
}
