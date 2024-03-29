import { createZodDto } from "nestjs-zod";
import { CreateRelationSchema, UpdateRelationSchema } from "@/definitions";

export class CreateRelationDto extends createZodDto(CreateRelationSchema) {}

export class UpdateRelationDto extends createZodDto(UpdateRelationSchema) {}
