import { z } from "zod";

export const ExternalColumnSchema = z.object({
  name: z.string().nonempty(),
  type: z.string().nonempty(),
  is_nullable: z.boolean(),
  is_identity: z.boolean(),
  // is_unique: z.boolean(),
  is_updateable: z.boolean(),
  default_expression: z.string().nullable(),
});

export const ExternalTableSchema = z.object({
  name: z.string().nonempty(),
  schema: z.string().nonempty(),
  table: z.string().nonempty(),
  columns: z.array(ExternalColumnSchema),
});

export type ExternalColumn = z.infer<typeof ExternalColumnSchema>;
export type ExternalTable = z.infer<typeof ExternalTableSchema>;
