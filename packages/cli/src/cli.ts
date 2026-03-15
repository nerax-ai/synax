#!/usr/bin/env node
import { Command } from 'commander';
import { registerStartCommand } from './commands/start.js';
import { registerProviderCommands } from './commands/provider.js';
import { registerGroupCommands } from './commands/group.js';
import { registerEndpointCommands } from './commands/endpoint.js';

const program = new Command();

program
  .name('synax')
  .description('Synax AI CLI')
  .version('0.0.11');

registerStartCommand(program);
registerProviderCommands(program);
registerGroupCommands(program);
registerEndpointCommands(program);

program.parse();
