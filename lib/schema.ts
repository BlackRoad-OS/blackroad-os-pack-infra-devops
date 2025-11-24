import { z } from 'zod';

export const PipelineFrontMatter = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  required_secrets: z.array(z.string()).default([]),
});

export type PipelineFrontMatter = z.infer<typeof PipelineFrontMatter>;

export const RenderContext = z.object({
  name: z.string().min(1),
  service: z.string().min(1).default('core'),
});

export type RenderContext = z.infer<typeof RenderContext>;
