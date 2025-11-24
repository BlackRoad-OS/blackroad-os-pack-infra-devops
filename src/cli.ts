import { spawnSync } from 'child_process';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { loadPipelineTemplate } from '../lib/template.js';

const agentsDir = path.join(process.cwd(), 'agents');

async function renderPipeline(name: string) {
  const template = await loadPipelineTemplate(name);
  const rendered = template.render({ name: template.frontmatter.name });
  process.stdout.write(rendered);
}

yargs(hideBin(process.argv))
  .scriptName('br-infra')
  .command(
    'render <pipeline>',
    'Render a pipeline template to stdout',
    (y) => y.positional('pipeline', { type: 'string', demandOption: true }),
    async (args) => {
      await renderPipeline(args.pipeline as string);
    }
  )
  .command(
    'deploy <service>',
    'Invoke the deploy agent for a service',
    (y) => y.positional('service', { type: 'string', demandOption: true }),
    (args) => {
      const script = path.join(agentsDir, 'deploy.sh');
      const result = spawnSync(script, {
        stdio: 'inherit',
        env: { ...process.env, SERVICE: args.service as string },
      });
      process.exit(result.status ?? 0);
    }
  )
  .command(
    'rollback <service>',
    'Invoke rollback agent for a service',
    (y) =>
      y
        .positional('service', { type: 'string', demandOption: true })
        .option('target', { type: 'string', default: 'previous' }),
    (args) => {
      const script = path.join(agentsDir, 'rollback.sh');
      const result = spawnSync(script, {
        stdio: 'inherit',
        env: { ...process.env, SERVICE: args.service as string, TARGET_SHA: args.target as string },
      });
      process.exit(result.status ?? 0);
    }
  )
  .command(
    'scale <service>',
    'Scale a Railway service via the TypeScript agent',
    (y) =>
      y
        .positional('service', { type: 'string', demandOption: true })
        .option('replicas', { type: 'number', default: 1 }),
    (args) => {
      const entry = path.join(agentsDir, 'scale.ts');
      const result = spawnSync('ts-node', [entry], {
        stdio: 'inherit',
        env: { ...process.env, SERVICE: args.service as string, SCALE_TARGET: String(args.replicas) },
      });
      process.exit(result.status ?? 0);
    }
  )
  .demandCommand(1)
  .help().argv;
