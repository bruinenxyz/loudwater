import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { RelationsService } from "./relations.service";
import { CreateRelationDto, UpdateRelationDto } from "./dtos/relation.dto";

@Controller("relations")
export class RelationsController {
  constructor(private readonly relationsService: RelationsService) {}

  @Post()
  create(@Body() createRelationDto: CreateRelationDto) {
    return this.relationsService.create(createRelationDto);
  }

  @Get("/db/:databaseId")
  findAllForDatabase(@Param("databaseId") databaseId: string) {
    return this.relationsService.findAllForDatabase(databaseId);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.relationsService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateRelationDto: UpdateRelationDto,
  ) {
    return this.relationsService.update(id, updateRelationDto);
  }

  @Delete(":id")
  delete(@Param("id") id: string) {
    return this.relationsService.delete(id);
  }
}
