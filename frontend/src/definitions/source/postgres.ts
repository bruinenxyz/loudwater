import { z } from "zod";

export const PostgresConfigSchema = z.object({
  sourceType: z.literal("postgres"),
  postgres_url: z.string(),
  schema: z.string().optional(),
});

export type PostgresCreateConfig = z.infer<typeof PostgresConfigSchema>;

export const PostgresSourceConfigSchema = z.object({
  schema: z.string(),
});

export type PostgresSourceConfig = z.infer<typeof PostgresSourceConfigSchema>;

export const PostgresStreamsConfigSchema = z.object({
  sourceType: z.literal("postgres"),
  sourceId: z.string(),
  connectionUrl: z.string(),
});

export type PostgresStreamsConfig = z.infer<typeof PostgresStreamsConfigSchema>;

export const PostgresSchemaConfigSchema = z.object({
  sourceType: z.literal("postgres"),
  sourceId: z.string(),
  datasetId: z.string(),
  datasetExternalName: z.string(),
  connectionUrl: z.string(),
});
export type PostgresSchemaConfig = z.infer<typeof PostgresSchemaConfigSchema>;
