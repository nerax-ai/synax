import { Command } from 'commander';
import inquirer from 'inquirer';
import type { EndpointConfig } from '@synax-ai/server';
import { getConfigStore } from '../utils.js';
import { getPluginRegistry, promptSchema } from '../schema-utils.js';

export function registerEndpointCommands(program: Command) {
  const endpoint = program.command('endpoint').description('Manage endpoints');

  endpoint
    .command('list')
    .description('List all endpoints')
    .action(async () => {
      const store = getConfigStore();
      const config = await store.getConfig();
      console.log('Endpoints:');
      if (!config.endpoints?.length) {
        console.log('  (none)');
      } else {
        config.endpoints.forEach((e) => console.log(`  - ${e.use} at ${e.basePath || 'default'}`));
      }
    });

  endpoint
    .command('add')
    .description('Add an endpoint')
    .action(async () => {
      const store = getConfigStore();
      const config = await store.getConfig();
      const registry = await getPluginRegistry();

      for (const source of config.plugins ?? []) {
        await registry.load(source);
      }

      const endpoints = registry.listExtensions('endpoint').map((e: any) => e.id);
      if (!endpoints.length) {
        console.log('No endpoint plugins found');
        return;
      }

      const basic = await inquirer.prompt([
        { type: 'list', name: 'use', message: 'Endpoint plugin:', choices: endpoints },
        { type: 'input', name: 'basePath', message: 'Base path:' },
      ]);

      const schema = registry.getExtensionSchema('endpoint', basic.use);
      const options = schema ? await promptSchema(schema) : {};

      await store.addEndpoint({ ...basic, options });
      console.log(`Endpoint ${basic.use} added`);
    });

  endpoint
    .command('remove <use>')
    .description('Remove an endpoint')
    .action(async (use: string) => {
      const store = getConfigStore();
      const removed = await store.removeEndpoint(use);
      console.log(removed ? `Endpoint ${use} removed` : 'Endpoint not found');
    });
}
