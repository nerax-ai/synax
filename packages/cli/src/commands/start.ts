import { Command } from 'commander';

export function registerStartCommand(program: Command) {
  program
    .command('start')
    .description('Start the Synax server')
    .option('-p, --port <port>', 'Port to listen on', '3000')
    .action(async (opts: { port: string }) => {
      process.env.PORT = opts.port;
      await import('../index.js');
    });
}
