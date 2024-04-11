import { z } from "zod";

export const DatabaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  external_name: z.string(),
  connection_url: z.string(),
  encryption_vector: z.string(),
  organization_id: z.string(),
  require_ssl: z.boolean(),
  created_at: z.date(),
  updated_at: z.date(),
  deleted_at: z.date().nullable(),
});
export type Database = z.infer<typeof DatabaseSchema>;

export const CleanDatabaseSchema = DatabaseSchema.omit({
  connection_url: true,
  encryption_vector: true,
});
export type CleanDatabase = z.infer<typeof CleanDatabaseSchema>;

export const CreateDatabaseSchema = DatabaseSchema.omit({
  id: true,
  external_name: true,
  encryption_vector: true,
  organization_id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
}).merge(z.object({ schema: z.string().optional() }));
export type CreateDatabase = z.infer<typeof CreateDatabaseSchema>;

export const UpdateDatabaseSchema = DatabaseSchema.omit({
  id: true,
  external_name: true,
  connection_url: true,
  encryption_vector: true,
  organization_id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
}).partial();
export type UpdateDatabase = z.infer<typeof UpdateDatabaseSchema>;
