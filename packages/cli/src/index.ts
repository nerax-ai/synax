#!/usr/bin/env bun
import { createServer, FileConfigStore } from '@synax-ai/server';
import { PluginRegistry } from '@nerax-ai/plugin';
import { getStorage } from '@nerax-ai/storage';
import { getLogger } from '@nerax-ai/logger';
import { join } from 'path';

const log = getLogger('synax', {
  files: [{ filename: 'synax-%DATE%.log', level: 'debug' }],
});

PluginRegistry.getInstance({ appName: 'synax', logger: log });

async function main() {
  const storage = getStorage('synax');
  const configPath = join(storage.config.path, 'synax.json');
  const configStore = new FileConfigStore(configPath);
  const port = parseInt(process.env.PORT || '3000', 10);

  const { app } = await createServer({ configStore, logger: log });

  Bun.serve({ port, fetch: app.fetch, idleTimeout: 60 });
  log.info(`Synax server running on http://localhost:${port}`);
  log.info(`Config: ${configPath}`);
}

main().catch((err) => {
  log.error('Failed to start server:', err);
  process.exit(1);
});
