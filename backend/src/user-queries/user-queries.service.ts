import { UserQuery, UserQuerySchema } from "@/definitions";
import { PrismaService } from "@/prisma/prisma.service";
import { PostgresAdapterService } from "@/postgres-adapter/postgres-adapter.service";
import { HttpRequestContextService } from "@/shared/http-request-context/http-request-context.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import {
  CreateUserQueryDto,
  UpdateUserQueryDto,
} from "./dtos/user-queries.dto";
import { TablesService } from "@/tables/tables.service";
import { writeSQL } from "./query-parsing/parse-query";
import { QueryResult } from "pg";
import * as assert from "assert";
import * as _ from "lodash";

@Injectable()
export class UserQueriesService {
  constructor(
    private prismaService: PrismaService,
    private readonly httpRequestContextService: HttpRequestContextService,
    private readonly postgresAdapterService: PostgresAdapterService,
    private readonly tablesService: TablesService,
  ) {}

  async findAllForDatabase(databaseId: string): Promise<UserQuery[]> {
    const orgId = this.httpRequestContextService.checkAndGetOrgId();

    const userQueries = await this.prismaService.query.findMany({
      where: {
        deleted_at: null,
        organization_id: orgId,
        database_id: databaseId,
      },
    });

    return _.map(userQueries, (userQuery) => {
      return UserQuerySchema.parse(userQuery);
    });
  }

  async findOne(id: string): Promise<UserQuery> {
    const orgId = this.httpRequestContextService.checkAndGetOrgId();

    const userQuery = await this.prismaService.query.findUnique({
      where: {
        id,
        organization_id: orgId,
        deleted_at: null,
      },
    });

    assert(userQuery, new NotFoundException(`Query not found with id ${id}`));

    return UserQuerySchema.parse(userQuery);
  }

  async create(createUserQueryDto: CreateUserQueryDto): Promise<UserQuery> {
    const orgId = this.httpRequestContextService.checkAndGetOrgId();
    const creatorId = this.httpRequestContextService.checkAndGetUserId();

    if (createUserQueryDto.pipeline) {
      const tables = await this.tablesService.findAllForDatabase(
        createUserQueryDto.database_id,
      );
      const tableSchema = await this.postgresAdapterService.getAllTableSchema(
        createUserQueryDto.database_id,
      );
      createUserQueryDto.sql = writeSQL(
        createUserQueryDto.pipeline,
        tables,
        tableSchema,
      );
    }

    // Create the query record in DB
    const userQuery = await this.prismaService.query.create({
      data: {
        ...createUserQueryDto,
        creator_id: creatorId,
        organization_id: orgId,
        deleted_at: null,
      },
    });

    assert(userQuery, `Error creating query ${createUserQueryDto.name}`);

    return UserQuerySchema.parse(userQuery);
  }

  async update(
    id: string,
    updateUserQueryDto: UpdateUserQueryDto,
  ): Promise<UserQuery> {
    const orgId = this.httpRequestContextService.checkAndGetOrgId();

    const targetQuery = await this.prismaService.query.findUnique({
      where: {
        id,
        organization_id: orgId,
        deleted_at: null,
      },
    });

    assert(targetQuery, new NotFoundException(`Query not found with id ${id}`));

    if (updateUserQueryDto.pipeline) {
      const tables = await this.tablesService.findAllForDatabase(
        targetQuery.database_id,
      );
      const tableSchema = await this.postgresAdapterService.getAllTableSchema(
        targetQuery.database_id,
      );
      updateUserQueryDto.sql = writeSQL(
        updateUserQueryDto.pipeline,
        tables,
        tableSchema,
      );
    }

    const updateUserQuery = _.merge(targetQuery, updateUserQueryDto);

    // Update the query record in DB
    const userQuery = await this.prismaService.query.update({
      where: {
        id,
      },
      data: updateUserQuery,
    });

    return UserQuerySchema.parse(userQuery);
  }

  async delete(id: string): Promise<UserQuery> {
    const orgId = this.httpRequestContextService.checkAndGetOrgId();

    const targetUserQuery = await this.prismaService.query.findUnique({
      where: {
        id,
        organization_id: orgId,
        deleted_at: null,
      },
    });

    assert(
      targetUserQuery,
      new NotFoundException(`Query not found with id ${id}`),
    );

    // Set deleted_at field in DB
    const userQuery = await this.prismaService.query.update({
      where: {
        id,
      },
      data: {
        deleted_at: new Date(),
      },
    });

    return UserQuerySchema.parse(userQuery);
  }

  // TODO decide on the correct return type here
  async run(id: string): Promise<QueryResult<any>> {
    const userQuery = await this.findOne(id);

    assert(userQuery, new NotFoundException(`Query not found with id ${id}`));

    assert(
      userQuery.sql,
      `SQL statement not found for query ${userQuery.name}`,
    );

    const results = await this.postgresAdapterService.run({
      databaseId: userQuery.database_id,
      sql: userQuery.sql,
    });

    return results;
  }
}
