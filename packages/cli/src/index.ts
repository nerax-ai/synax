#!/usr/bin/env node
import { createServer } from '@synax-ai/server';
import { PluginRegistry } from '@nerax-ai/plugin';
import { getStorage } from '@nerax-ai/storage';

PluginRegistry.getInstance({ appName: 'synax' });

const storage = getStorage('synax');
const config = (await storage.config.readJSON('synax.json')) ?? { providers: [], groups: [] };
const port = parseInt(process.env.PORT || '3000', 10);

const { app } = await createServer({ config });

Bun.serve({ port, fetch: app.fetch, idleTimeout: 60 });
console.log(`Synax server running on http://localhost:${port}`);
console.log(`Config: ${storage.config.path}/synax.json`);
