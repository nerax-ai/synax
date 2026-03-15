import { Command } from 'commander';
import inquirer from 'inquirer';
import type { ProviderConfig } from '@synax-ai/sdk';
import { getConfigStore } from '../utils.js';
import { getPluginRegistry, promptSchema } from '../schema-utils.js';

export function registerProviderCommands(program: Command) {
  const provider = program.command('provider').description('Manage providers');

  provider
    .command('list')
    .description('List all providers')
    .action(async () => {
      const store = getConfigStore();
      const config = await store.getConfig();
      console.log('Providers:');
      if (!config.providers?.length) {
        console.log('  (none)');
      } else {
        config.providers.forEach((p) => console.log(`  - ${p.id}: ${p.use}`));
      }
    });

  provider
    .command('add')
    .description('Add a provider')
    .action(async () => {
      const store = getConfigStore();
      const config = await store.getConfig();
      const registry = await getPluginRegistry();

      // Load plugins from config
      for (const source of config.plugins ?? []) {
        await registry.load(source);
      }

      const providers = registry.listExtensions('provider').map((e: any) => e.id);
      if (!providers.length) {
        console.log('No provider plugins found');
        return;
      }

      const basic = await inquirer.prompt([
        {
          type: 'input',
          name: 'id',
          message: 'Provider ID:',
          validate: (v) => (v && !config.providers?.find((p) => p.id === v)) || 'ID required or exists',
        },
        { type: 'list', name: 'use', message: 'Provider plugin:', choices: providers },
        { type: 'input', name: 'proxy', message: 'Proxy URL (optional):' },
      ]);

      // Get schema and prompt for options
      const schema = registry.getExtensionSchema('provider', basic.use);
      const options = schema ? await promptSchema(schema) : {};
      
      await store.addProvider({ ...basic, options });
      console.log(`Provider ${basic.id} added`);
    });

  provider
    .command('remove <id>')
    .description('Remove a provider')
    .action(async (id: string) => {
      const store = getConfigStore();
      const removed = await store.removeProvider(id);
      console.log(removed ? `Provider ${id} removed` : 'Provider not found');
    });
}
