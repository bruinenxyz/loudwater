import { ExternalColumnSchema } from "./postgres-adapter";
import { z } from "zod";

export const TableConfigurationSchema = z.object({
  primary_key: z.string().optional(),
  title_property: z.string().optional(),
  hidden_columns: z.array(z.string()).optional(),
});
export type TableConfiguration = z.infer<typeof TableConfigurationSchema>;

export const TableSchema = z.object({
  id: z.string(),
  name: z.string(),
  external_name: z.string(),
  description: z.string().optional().nullable(),
  icon: z.string(),
  color: z.string(),
  configuration: TableConfigurationSchema,
  visibility: z.enum(["normal", "hidden"]),
  properties: z.any(),
  permissions: z.any(),
  database_id: z.string(),
  organization_id: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
  deleted_at: z.date().optional().nullable(),
});
export type Table = z.infer<typeof TableSchema>;

export const TablePropertySchema = z.object({
  external_name: z.string(),
  format: z.string(),
});

export const HydratedTableSchema = TableSchema.extend({
  external_columns: z.record(z.string(), ExternalColumnSchema),
});
export type HydratedTable = z.infer<typeof HydratedTableSchema>;

export const CreateTableSchema = TableSchema.omit({
  id: true,
  organization_id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});
export type CreateTable = z.infer<typeof CreateTableSchema>;

export const UpdateTableSchema = TableSchema.omit({
  id: true,
  external_name: true,
  organization_id: true,
  properties: true,
  permissions: true,
  database_id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
}).partial();
export type UpdateTable = z.infer<typeof UpdateTableSchema>;
