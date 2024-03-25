import { z } from "zod";

export const UploadConfigSchema = z.object({
  sourceType: z.literal("upload"),
});

export type UploadCreateConfig = z.infer<typeof UploadConfigSchema>;

export const UploadSourceConfigSchema = z.object({
  airbyte_source_id: z.string(),
  airbyte_destination_id: z.string().optional(),
});

export type UploadSourceConfig = z.infer<typeof UploadSourceConfigSchema>;
