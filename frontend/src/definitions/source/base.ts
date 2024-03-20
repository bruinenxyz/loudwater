import { z } from "zod";
import {
  SnowflakeConfigSchema,
  SnowflakeSourceConfigSchema,
} from "./snowflake";
import { PostgresConfigSchema, PostgresSourceConfigSchema } from "./postgres";
import { UploadConfigSchema, UploadSourceConfigSchema } from "./upload";

export const SourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  external_name: z.string(),
  source_type: z.enum(["snowflake", "upload", "postgres"]),
  configuration: z.union([
    SnowflakeSourceConfigSchema,
    PostgresSourceConfigSchema,
    UploadSourceConfigSchema,
  ]),
});

const CreateSourceConfigSchema = z.union([
  SnowflakeConfigSchema,
  PostgresConfigSchema,
  UploadConfigSchema,
]);

export const CreateSourceSchema = z.object({
  name: z.string(),
  configuration: CreateSourceConfigSchema,
});

export const UpdateSourceSchema = z.object({
  name: z.string(),
});

export const configs = {
  snowflake: SnowflakeConfigSchema,
};

export type Source = z.infer<typeof SourceSchema>;
export type CreateSource = z.infer<typeof CreateSourceSchema>;
export type UpdateSource = z.infer<typeof UpdateSourceSchema>;
