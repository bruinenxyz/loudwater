import { z } from "zod";

export enum RelationTypeEnum {
  OneToOne = "one_to_one",
  OneToMany = "one_to_many",
  ManyToMany = "many_to_many",
}
export const RelationTypeEnumSchema = z.nativeEnum(RelationTypeEnum);
export type RelationType = z.infer<typeof RelationTypeEnumSchema>;

export const RelationSchema = z.object({
  id: z.string(),
  organization_id: z.string(),
  generated: z.boolean(),
  database_id: z.string(),
  type: RelationTypeEnumSchema,
  table_1: z.string(),
  table_2: z.string(),
  column_1: z.string(),
  column_2: z.string(),
  join_table: z.string().optional().nullable(),
  join_column_1: z.string().optional().nullable(),
  join_column_2: z.string().optional().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
  deleted_at: z.date().optional().nullable(),
});
export type Relation = z.infer<typeof RelationSchema>;

export const CreateRelationSchema = RelationSchema.omit({
  id: true,
  organization_id: true,
  generated: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});
export type CreateRelation = z.infer<typeof CreateRelationSchema>;

export const UpdateRelationSchema = RelationSchema.omit({
  id: true,
  database_id: true,
  organization_id: true,
  generated: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
}).partial();
export type UpdateRelation = z.infer<typeof UpdateRelationSchema>;
