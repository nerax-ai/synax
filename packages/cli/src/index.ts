#!/usr/bin/env bun
import { createServer } from '@synax-ai/server';
import { PluginRegistry } from '@nerax-ai/plugin';
import { getStorage } from '@nerax-ai/storage';
import { getLogger } from '@nerax-ai/logger';

const log = getLogger('synax', {
  files: [{ filename: 'synax-%DATE%.log', level: 'debug' }],
});

PluginRegistry.getInstance({ appName: 'synax', logger: log });

async function main() {
  const storage = getStorage('synax');
  const config = (await storage.config.readJSON('synax.json')) ?? { providers: [], groups: [] };
  const port = parseInt(process.env.PORT || '3000', 10);

  const { app } = await createServer({ config, logger: log });

  Bun.serve({ port, fetch: app.fetch, idleTimeout: 60 });
  log.info(`Synax server running on http://localhost:${port}`);
  log.info(`Config: ${storage.config.path}/synax.json`);
}

main().catch((err) => {
  log.error('Failed to start server:', err);
  process.exit(1);
});
