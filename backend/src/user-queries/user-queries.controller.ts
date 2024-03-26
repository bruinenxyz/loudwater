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
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { UserQueriesService } from "./user-queries.service";
import { OrgGuard } from "@/auth/organizations.guard";
import { TrackingInterceptor } from "@/interceptors/tracking/tracking.interceptor";
import { UserQuery } from "@/definitions";
import {
  CreateUserQueryDto,
  UpdateUserQueryDto,
} from "./dtos/user-queries.dto";
import { QueryResult } from "pg";

@Controller("user-queries")
export class UserQueriesController {
  constructor(private readonly userQueriesService: UserQueriesService) {}

  @Get("/db/:databaseId")
  // TODO add tracking interceptor?
  findAllForDatabase(
    @Param("databaseId") databaseId: string,
  ): Promise<UserQuery[]> {
    return this.userQueriesService.findAllForDatabase(databaseId);
  }

  @Get("/:id")
  @UseGuards(OrgGuard("query"))
  // TODO add tracking interceptor?
  findOne(@Param("id") id: string): Promise<UserQuery> {
    return this.userQueriesService.findOne(id);
  }

  @Post("/")
  @UseInterceptors(TrackingInterceptor)
  // TODO add org guard?
  create(@Body() body: CreateUserQueryDto): Promise<UserQuery> {
    return this.userQueriesService.create(body);
  }

  @Patch("/:id")
  @UseGuards(OrgGuard("query"))
  @UseInterceptors(TrackingInterceptor)
  update(
    @Param("id") id: string,
    @Body() body: UpdateUserQueryDto,
  ): Promise<UserQuery> {
    return this.userQueriesService.update(id, body);
  }

  @Delete("/:id")
  @UseGuards(OrgGuard("query"))
  @UseInterceptors(TrackingInterceptor)
  delete(@Param("id") id: string): Promise<UserQuery> {
    return this.userQueriesService.delete(id);
  }

  @Get("/:id/run")
  @UseGuards(OrgGuard("query"))
  @UseInterceptors(TrackingInterceptor)
  async run(@Param("id") id: string): Promise<QueryResult<any>> {
    try {
      const results = await this.userQueriesService.run(id);
      return results;
    } catch (e) {
      throw new HttpException(
        e.message || "An error occurred while running the query",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}