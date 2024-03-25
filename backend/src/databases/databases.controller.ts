import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { DatabasesService } from "./databases.service";
import { OrgGuard } from "@/auth/organizations.guard";
import { TrackingInterceptor } from "@/interceptors/tracking/tracking.interceptor";
import { ZodSerializerDto } from "nestjs-zod";
import { ApiOkResponse } from "@nestjs/swagger";
import { CleanDatabase, CleanDatabaseSchema } from "@/definitions";
import {
  GetDatabaseResponseDto,
  GetAllDatabasesResponseDto,
  CreateDatabaseRequestDto,
  UpdateDatabaseRequestDto,
} from "./dtos/database.dto";

@Controller("databases")
export class DatabasesController {
  constructor(private readonly databasesService: DatabasesService) {}

  @Get("/")
  @ZodSerializerDto(CleanDatabaseSchema)
  @ApiOkResponse({ type: GetAllDatabasesResponseDto })
  findAll(): Promise<CleanDatabase[]> {
    return this.databasesService.findAll();
  }

  @Get("/:id")
  @ZodSerializerDto(CleanDatabaseSchema)
  @ApiOkResponse({ type: GetDatabaseResponseDto })
  @UseGuards(OrgGuard("database"))
  findOne(@Param("id") id: string): Promise<CleanDatabase | null> {
    return this.databasesService.findOne(id);
  }

  @Post("/")
  @ZodSerializerDto(CleanDatabaseSchema)
  @ApiOkResponse({ type: GetDatabaseResponseDto })
  @UseInterceptors(TrackingInterceptor)
  createDatabase(
    @Body() body: CreateDatabaseRequestDto,
  ): Promise<CleanDatabase> {
    return this.databasesService.createDatabase(body);
  }

  @Patch("/:id")
  @UseGuards(OrgGuard("database"))
  @UseInterceptors(TrackingInterceptor)
  @ZodSerializerDto(CleanDatabaseSchema)
  @ApiOkResponse({ type: GetDatabaseResponseDto })
  updateDatabase(
    @Param("id") id: string,
    @Body() body: UpdateDatabaseRequestDto,
  ): Promise<CleanDatabase> {
    return this.databasesService.updateDatabase(id, body);
  }

  @Delete("/:id")
  @UseGuards(OrgGuard("database"))
  @UseInterceptors(TrackingInterceptor)
  @ZodSerializerDto(CleanDatabaseSchema)
  @ApiOkResponse({ type: GetDatabaseResponseDto })
  deleteDatabase(@Param("id") id: string): Promise<CleanDatabase> {
    return this.databasesService.deleteDatabase(id);
  }
}
