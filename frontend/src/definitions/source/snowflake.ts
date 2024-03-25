import { z } from "zod";

export const SnowflakeOAuthSchema = z.object({
  auth_type: z.literal("OAuth"),
  client_id: z.string(),
  client_secret: z.string(),
  access_token: z.string().optional(),
  refresh_token: z.string().optional(),
});

export const SnowflakeUPSchema = z.object({
  auth_type: z.literal("username/password"),
  username: z.string(),
  password: z.string(),
});

export const SnowflakeConfigSchema = z.object({
  credentials: z.union([SnowflakeOAuthSchema, SnowflakeUPSchema]),
  host: z.string(),
  role: z.string(),
  warehouse: z.string(),
  database: z.string(),
  sourceType: z.literal("snowflake"),
  schema: z.string().optional(),
  jdbc_url_params: z.string().optional(),
});

export type SnowflakeCreateConfig = z.infer<typeof SnowflakeConfigSchema>;

export const SnowflakeSourceConfigSchema = z.object({
  airbyte_source_id: z.string(),
  airbyte_destination_id: z.string().optional(),
});

export type SnowflakeSourceConfig = z.infer<typeof SnowflakeSourceConfigSchema>;

export const SnowflakeSchemaConfigSchema = z.object({
  sourceType: z.literal("snowflake"),
  datasetId: z.string(),
});
export type SnowflakeSchemaConfig = z.infer<typeof SnowflakeSchemaConfigSchema>;
