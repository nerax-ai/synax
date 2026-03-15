import type { ProviderConfig, GroupConfig } from '@synax-ai/sdk';
import type { ConfigStore, ServerConfig, EndpointConfig } from './types';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

export class FileConfigStore implements ConfigStore {
  constructor(private path: string) {}

  async getConfig(): Promise<ServerConfig> {
    if (!existsSync(this.path)) {
      return { providers: [], groups: [], plugins: [], endpoints: [], api: [] };
    }
    return JSON.parse(readFileSync(this.path, 'utf-8'));
  }

  async updateConfig(config: ServerConfig): Promise<void> {
    const dir = dirname(this.path);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(this.path, JSON.stringify(config, null, 2));
  }

  async addProvider(provider: ProviderConfig): Promise<void> {
    const config = await this.getConfig();
    config.providers = config.providers || [];
    config.providers.push(provider);
    await this.updateConfig(config);
  }

  async updateProvider(id: string, provider: ProviderConfig): Promise<boolean> {
    return this.updateItem('providers', (p) => p.id === id, provider);
  }

  async removeProvider(id: string): Promise<boolean> {
    return this.removeItem('providers', (p) => p.id === id);
  }

  async addGroup(group: GroupConfig): Promise<void> {
    const config = await this.getConfig();
    config.groups = config.groups || [];
    config.groups.push(group);
    await this.updateConfig(config);
  }

  async updateGroup(id: string, group: GroupConfig): Promise<boolean> {
    return this.updateItem('groups', (g) => g.id === id, group);
  }

  async removeGroup(id: string): Promise<boolean> {
    return this.removeItem('groups', (g) => g.id === id);
  }

  async addEndpoint(endpoint: EndpointConfig): Promise<void> {
    const config = await this.getConfig();
    config.endpoints = config.endpoints || [];
    config.endpoints.push(endpoint);
    await this.updateConfig(config);
  }

  async removeEndpoint(use: string): Promise<boolean> {
    return this.removeItem('endpoints', (e) => e.use === use);
  }

  private async updateItem<K extends keyof ServerConfig>(
    key: K,
    predicate: (item: any) => boolean,
    newItem: any
  ): Promise<boolean> {
    const config = await this.getConfig();
    const arr = config[key] as any[];
    const idx = arr?.findIndex(predicate) ?? -1;
    if (idx === -1) return false;
    arr[idx] = newItem;
    await this.updateConfig(config);
    return true;
  }

  private async removeItem<K extends keyof ServerConfig>(
    key: K,
    predicate: (item: any) => boolean
  ): Promise<boolean> {
    const config = await this.getConfig();
    const arr = config[key] as any[];
    const idx = arr?.findIndex(predicate) ?? -1;
    if (idx === -1) return false;
    arr.splice(idx, 1);
    await this.updateConfig(config);
    return true;
  }
}
