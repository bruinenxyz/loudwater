import { z } from "zod";
import { ChartSchema } from "./displays/charts/charts";

export enum UserQueryType {
  sql = "sql",
  pipeline = "pipeline",
}

export const UserQuerySchema = z.object({
  id: z.string(),
  type: z.nativeEnum(UserQueryType),
  name: z.string(),
  description: z.string().optional(),
  sql: z.string().optional(),
  pipeline: z.any().optional(), // TODO replace with actual pipeline schema
  parameters: z.any().optional(), // TODO replace with actual parameter schema
  scope: z.enum(["private", "organization"]), // TODO turn this into an enum
  permissions: z.record(z.any()), // TODO update
  charts: z.array(ChartSchema),
  favorited_by: z.array(z.string()),
  organization_id: z.string(),
  creator_id: z.string(),
  database_id: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
  deleted_at: z.date().nullable(),
});
export type UserQuery = z.infer<typeof UserQuerySchema>;

export const CreateUserQuerySchema = UserQuerySchema.omit({
  id: true,
  organization_id: true,
  creator_id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});
export type CreateUserQuery = z.infer<typeof CreateUserQuerySchema>;

export const UpdateUserQuerySchema = UserQuerySchema.omit({
  id: true,
  organization_id: true,
  creator_id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
}).partial();
export type UpdateUserQuery = z.infer<typeof UpdateUserQuerySchema>;
