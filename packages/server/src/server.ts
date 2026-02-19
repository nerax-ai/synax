import { Synax } from '@synax-ai/core';
import type { ProviderConfig, GroupConfig, ApiContext } from '@synax-ai/sdk';
import { PluginRegistry } from '@nerax-ai/plugin';
import type { EndpointContext } from '@synax-ai/sdk';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

export interface EndpointConfig {
  use: string;
  basePath?: string;
  options?: Record<string, unknown>;
}

export interface ServerConfig {
  appName?: string;
  plugins?: string[];
  providers?: (ProviderConfig | import('@synax-ai/sdk').Provider)[];
  groups?: GroupConfig[];
  endpoints?: EndpointConfig[];
  api?: EndpointConfig[];
}

export interface ServerOptions {
  config: ServerConfig;
}

export async function createServer(options: ServerOptions) {
  const { config } = options;
  const registry = PluginRegistry.getInstance<any, any>();

  for (const source of config.plugins ?? []) {
    await registry.load(source);
  }

  const synax = new Synax({ appName: config.appName, providers: [], groups: config.groups ?? [] });
  for (const p of config.providers ?? []) {
    await synax.addProvider(p as any);
  }

  const app = new Hono();
  app.use('*', cors());
  app.get('/health', (c) => c.json({ status: 'ok', version: '0.0.1' }));

  // Mount endpoint plugins
  for (const ec of config.endpoints ?? []) {
    const factory = registry.listExtensions('endpoint').find((e: any) => e.fullId === ec.use || e.id === ec.use);
    if (!factory) {
      console.warn(`[server] endpoint not found: ${ec.use}`);
      continue;
    }
    const endpoint = (factory.factory as any)(ec.options ?? {});
    const sub = new Hono();
    const ctx: EndpointContext = {
      language: synax.language,
      embedding: synax.embedding,
      image: synax.image,
      speech: synax.speech,
      video: synax.video,
      models: () => synax.listModels(),
    };
    endpoint.registerRoutes(sub, ctx);
    app.route(ec.basePath ?? endpoint.basePath, sub);
  }

  // Mount api plugins under /api
  const apiCtx: ApiContext = { models: () => synax.listModels() };
  for (const ac of config.api ?? []) {
    const factory = registry.listExtensions('api').find((e: any) => e.fullId === ac.use || e.id === ac.use);
    if (!factory) {
      console.warn(`[server] api plugin not found: ${ac.use}`);
      continue;
    }
    const plugin = (factory.factory as any)(ac.options ?? {});
    const sub = new Hono();
    plugin.registerRoutes(sub, apiCtx);
    app.route(`/api${ac.basePath ?? plugin.basePath}`, sub);
  }

  return { app, synax };
}
