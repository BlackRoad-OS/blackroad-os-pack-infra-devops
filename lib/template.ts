import { promises as fs } from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import { parse } from 'yaml';
import { PipelineFrontMatter, RenderContext } from './schema.js';

const PIPELINE_DIR = path.join(process.cwd(), 'pipelines');

const FRONT_MATTER_REGEX = /^# ---\n([\s\S]*?)\n# ---\n/;

export type PipelineTemplate = {
  frontmatter: PipelineFrontMatter;
  render: (context?: Partial<RenderContext>) => string;
};

function extractFrontMatter(content: string) {
  const match = content.match(FRONT_MATTER_REGEX);
  if (!match) {
    return { attributes: {}, body: content };
  }

  const yamlLines = match[1].replace(/^#\s?/gm, '');
  const attributes = parse(yamlLines) ?? {};
  const body = content.replace(FRONT_MATTER_REGEX, '').trimStart();

  return { attributes, body };
}

export async function loadPipelineTemplate(name: string): Promise<PipelineTemplate> {
  const filePath = path.join(PIPELINE_DIR, `${name}.yaml.hbs`);
  const raw = await fs.readFile(filePath, 'utf-8');
  const { attributes, body } = extractFrontMatter(raw);

  const frontmatter = PipelineFrontMatter.parse(attributes);
  const compiled = Handlebars.compile(body);

  return {
    frontmatter,
    render: (ctx?: Partial<RenderContext>) => {
      const context = RenderContext.parse({
        name: ctx?.name ?? frontmatter.name,
        service: ctx?.service ?? 'core',
      });
      return compiled(context).trim() + '\n';
    },
  };
}
