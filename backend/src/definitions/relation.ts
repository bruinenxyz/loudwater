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
  database_id: z.string(),
  type: RelationTypeEnumSchema,
  table_1: z.string(),
  table_2: z.string(),
  column_1: z.string(),
  column_2: z.string(),
  join_table: z.string().optional(),
  join_column_1: z.string().optional(),
  join_column_2: z.string().optional(),
  created_at: z.date(),
  updated_at: z.date(),
  deleted_at: z.date().optional().nullable(),
});
export type Relation = z.infer<typeof RelationSchema>;

export const CreateRelationSchema = RelationSchema.omit({
  id: true,
  organization_id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});
export type CreateRelation = z.infer<typeof CreateRelationSchema>;

export const UpdateRelationSchema = RelationSchema.omit({
  id: true,
  database_id: true,
  organization_id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
}).partial();
export type UpdateRelation = z.infer<typeof UpdateRelationSchema>;
