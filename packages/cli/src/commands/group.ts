import { Command } from 'commander';
import inquirer from 'inquirer';
import type { GroupConfig, GroupMemberConfig } from '@synax-ai/sdk';
import { getConfigStore } from '../utils.js';

export function registerGroupCommands(program: Command) {
  const group = program.command('group').description('Manage groups');

  group
    .command('list')
    .description('List all groups')
    .action(async () => {
      const store = getConfigStore();
      const config = await store.getConfig();
      console.log('Groups:');
      if (!config.groups?.length) {
        console.log('  (none)');
      } else {
        config.groups.forEach((g) => console.log(`  - ${g.id}: ${g.members.length} members`));
      }
    });

  group
    .command('add')
    .description('Add a group')
    .action(async () => {
      const store = getConfigStore();
      const config = await store.getConfig();
      const answers = await inquirer.prompt<{ id: string; use?: string }>([
        {
          type: 'input',
          name: 'id',
          message: 'Group ID:',
          validate: (v) => (v && !config.groups?.find((g) => g.id === v)) || 'ID required or exists',
        },
        { type: 'input', name: 'use', message: 'Dispatcher (optional):' },
      ]);

      const members: GroupMemberConfig[] = [];
      let addMore = true;
      while (addMore) {
        const m = await inquirer.prompt<GroupMemberConfig & { addMore: boolean }>([
          { type: 'input', name: 'provider', message: 'Provider ID:', validate: (v) => !!v || 'Required' },
          { type: 'input', name: 'model', message: 'Model (optional):' },
          { type: 'confirm', name: 'addMore', message: 'Add another member?', default: false },
        ]);
        members.push({ provider: m.provider, model: m.model });
        addMore = m.addMore;
      }

      await store.addGroup({ id: answers.id, use: answers.use, members });
      console.log(`Group ${answers.id} added with ${members.length} members`);
    });

  group
    .command('remove <id>')
    .description('Remove a group')
    .action(async (id: string) => {
      const store = getConfigStore();
      const removed = await store.removeGroup(id);
      console.log(removed ? `Group ${id} removed` : 'Group not found');
    });
}
