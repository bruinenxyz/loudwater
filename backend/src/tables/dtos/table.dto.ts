import { createZodDto } from "nestjs-zod";
import {
  HydratedTableSchema,
  CreateTableSchema,
  UpdateTableSchema,
  UpdateTableRowSchema,
} from "@/definitions";

export class GetTableResponseDto extends createZodDto(HydratedTableSchema) {}

export class GetAllTablesResponseDto extends createZodDto(
  HydratedTableSchema.array(),
) {}

export class UpdateTableRowRequestDto extends createZodDto(
  UpdateTableRowSchema,
) {}

export class CreateTableRequestDto extends createZodDto(CreateTableSchema) {}

export class UpdateTableRequestDto extends createZodDto(UpdateTableSchema) {}
