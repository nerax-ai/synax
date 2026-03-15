import { Synax } from '@synax-ai/core';
import type { ProviderConfig, GroupConfig, ApiContext } from '@synax-ai/sdk';
import type { ConfigStore, ServerConfig, EndpointConfig } from './types';
import { PluginRegistry } from '@nerax-ai/plugin';
import type { EndpointContext } from '@synax-ai/sdk';
import type { Logger } from '@nerax-ai/logger';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

export interface ServerOptions {
  configStore: ConfigStore;
  logger?: Logger;
}

const ok = (data: any) => ({ success: true, data });
const err = (message: string) => ({ success: false, error: message });

export async function createServer(options: ServerOptions) {
  const { configStore, logger } = options;
  const config = await configStore.getConfig();
  const log: Logger = logger ?? {
    info: console.log,
    warn: console.warn,
    debug: () => {},
    error: console.error,
    scope: () => log,
  };
  const registry = PluginRegistry.getInstance({ appName: config.appName ?? 'synax' });

  for (const source of config.plugins ?? []) {
    await registry.load(source);
  }

  const synax = new Synax({ appName: config.appName, logger: log, providers: [], groups: config.groups ?? [] });
  for (const p of config.providers ?? []) {
    await synax.addProvider(p as any);
  }

  const app = new Hono();
  app.use('*', cors());
  app.get('/health', (c) => c.json({ status: 'ok', version: '0.0.1' }));

  // Config API
  app.get('/api/config', async (c) => c.json(ok(await configStore.getConfig())));

  // Provider API
  app.get('/api/providers', async (c) => {
    const cfg = await configStore.getConfig();
    return c.json(ok(cfg.providers || []));
  });
  app.post('/api/providers', async (c) => {
    const body = await c.req.json<ProviderConfig>();
    if (!body.id || !body.use) return c.json(err('id and use required'), 400);
    await configStore.addProvider(body);
    await synax.addProvider(body);
    return c.json(ok({ message: 'Provider added' }));
  });
  app.put('/api/providers/:id', async (c) => {
    const body = await c.req.json<ProviderConfig>();
    const updated = await configStore.updateProvider(c.req.param('id'), body);
    if (!updated) return c.json(err('Provider not found'), 404);
    await synax.updateProvider(body);
    return c.json(ok({ message: 'Provider updated' }));
  });
  app.delete('/api/providers/:id', async (c) => {
    const removed = await configStore.removeProvider(c.req.param('id'));
    if (!removed) return c.json(err('Provider not found'), 404);
    return c.json(ok({ message: 'Provider removed', note: 'Restart required' }));
  });

  // Group API
  app.get('/api/groups', async (c) => {
    const cfg = await configStore.getConfig();
    return c.json(ok(cfg.groups || []));
  });
  app.post('/api/groups', async (c) => {
    const body = await c.req.json<GroupConfig>();
    if (!body.id) return c.json(err('id required'), 400);
    await configStore.addGroup(body);
    synax.addGroup(body);
    return c.json(ok({ message: 'Group added' }));
  });
  app.put('/api/groups/:id', async (c) => {
    const body = await c.req.json<GroupConfig>();
    const updated = await configStore.updateGroup(c.req.param('id'), body);
    if (!updated) return c.json(err('Group not found'), 404);
    synax.addGroup(body);
    return c.json(ok({ message: 'Group updated' }));
  });
  app.delete('/api/groups/:id', async (c) => {
    const removed = await configStore.removeGroup(c.req.param('id'));
    if (!removed) return c.json(err('Group not found'), 404);
    return c.json(ok({ message: 'Group removed', note: 'Restart required' }));
  });

  // Endpoint API
  app.get('/api/endpoints', async (c) => {
    const cfg = await configStore.getConfig();
    return c.json(ok(cfg.endpoints || []));
  });
  app.post('/api/endpoints', async (c) => {
    const body = await c.req.json<EndpointConfig>();
    if (!body.use) return c.json(err('use required'), 400);
    await configStore.addEndpoint(body);
    return c.json(ok({ message: 'Endpoint added' }));
  });
  app.delete('/api/endpoints/:use', async (c) => {
    const removed = await configStore.removeEndpoint(c.req.param('use'));
    if (!removed) return c.json(err('Endpoint not found'), 404);
    return c.json(ok({ message: 'Endpoint removed' }));
  });

  // Registry API
  app.get('/api/registry/providers', (c) => {
    const providers = registry.listExtensions('provider').map((e: any) => ({ id: e.id, fullId: e.fullId }));
    return c.json(ok(providers));
  });
  app.get('/api/registry/endpoints', (c) => {
    const endpoints = registry.listExtensions('endpoint').map((e: any) => ({ id: e.id, fullId: e.fullId }));
    return c.json(ok(endpoints));
  });
  app.get('/api/models', (c) => c.json(ok(synax.listModels())));

  // Mount endpoint plugins
  for (const ec of config.endpoints ?? []) {
    const factory = registry.listExtensions('endpoint').find((e: any) => e.fullId === ec.use || e.id === ec.use);
    if (!factory) {
      log.warn(`[server] endpoint not found: ${ec.use}`);
      continue;
    }
    const endpoint = (factory.factory as any)(ec.options ?? {});
    const sub = new Hono();
    const ctx: EndpointContext = {
      logger: synax.logger.scope(`endpoint-${ec.use}`),
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
      log.warn(`[server] api plugin not found: ${ac.use}`);
      continue;
    }
    const plugin = (factory.factory as any)(ac.options ?? {});
    const sub = new Hono();
    plugin.registerRoutes(sub, apiCtx);
    app.route(`/api${ac.basePath ?? plugin.basePath}`, sub);
  }

  return { app, synax };
}
