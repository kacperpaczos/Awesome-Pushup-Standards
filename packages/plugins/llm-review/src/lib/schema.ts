import { z } from 'zod';

export const dimensionSchema = z.object({
  name: z.string(),
  score: z.number().min(0).max(5),
  justification: z.string(),
});

export const llmResponseSchema = z.object({
  dimensions: z.array(dimensionSchema).min(1),
});

export type LlmDimension = z.infer<typeof dimensionSchema>;

export const RUBRIC_DIMENSIONS = [
  'architecture',
  'naming',
  'consistency',
  'modern-alternatives',
  'readability',
] as const;
