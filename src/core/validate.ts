import { z } from 'zod';

export const AppNameSchema = z.string()
  .min(1)
  .max(64)
  .regex(/^[a-zA-Z0-9_-]+$/, 'App name must contain only alphanumeric characters, hyphens, and underscores');

export const EnvVarSchema = z.record(z.string());

export const PortSchema = z.number().int().min(1024).max(65535);

export const ComposeFileSchema = z.string().min(1);

export const MigrationFileSchema = z.string().min(1);

export const BackupNameSchema = z.string()
  .regex(/^[a-zA-Z0-9_-]+\.sql$/, 'Backup name must be alphanumeric with .sql extension');

export function validateArgs<T>(schema: z.ZodSchema<T>, args: unknown): T {
  const result = schema.safeParse(args);
  
  if (!result.success) {
    const errors = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
    throw new Error(`Validation failed: ${errors}`);
  }
  
  return result.data;
}