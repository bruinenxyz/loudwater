import { createZodDto } from "nestjs-zod";
import {
  CleanDatabaseSchema,
  UpdateDatabaseSchema,
  CreateDatabaseSchema,
} from "@/definitions";

export class GetDatabaseResponseDto extends createZodDto(CleanDatabaseSchema) {}

export class GetAllDatabasesResponseDto extends createZodDto(
  CleanDatabaseSchema.array(),
) {}

export class CreateDatabaseRequestDto extends createZodDto(
  CreateDatabaseSchema,
) {}

export class UpdateDatabaseRequestDto extends createZodDto(
  UpdateDatabaseSchema,
) {}
