import { createZodDto } from "nestjs-zod";
import { CreateUserQuerySchema, UpdateUserQuerySchema } from "@/definitions";

export class CreateUserQueryDto extends createZodDto(CreateUserQuerySchema) {}

export class UpdateUserQueryDto extends createZodDto(UpdateUserQuerySchema) {}
