import { UserQuery, UserQuerySchema } from "@/definitions";
import { PrismaService } from "@/prisma/prisma.service";
import { PostgresAdapterService } from "@/postgres-adapter/postgres-adapter.service";
import { HttpRequestContextService } from "@/shared/http-request-context/http-request-context.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import * as assert from "assert";
import {
  CreateUserQueryDto,
  UpdateUserQueryDto,
} from "./dtos/user-queries.dto";
import * as _ from "lodash";
import { QueryResult } from "pg";

@Injectable()
export class UserQueriesService {
  constructor(
    private prismaService: PrismaService,
    private readonly httpRequestContextService: HttpRequestContextService,
    private readonly postgresAdapterService: PostgresAdapterService,
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
  async run(id: string, query): Promise<QueryResult<any>> {
    const userQuery = await this.findOne(id);

    assert(userQuery, new NotFoundException(`Query not found with id ${id}`));

    // TODO once pipelines are added, parse and run them here
    if (userQuery.type === "pipeline") {
      throw new Error("Pipelines are not yet supported");
    } else {
      assert(
        userQuery.sql,
        `SQL statement not found for query ${userQuery.name}`,
      );
      const { sql, params } = parseParametersFromSQL(userQuery.sql, query);
      const results = await this.postgresAdapterService.run({
        databaseId: userQuery.database_id,
        sql: sql,
        values: params,
      });

      return results;
    }
  }
}

const parseParametersFromSQL = (
  sql: string,
  parameters: Record<string, any>,
): { sql: string; params: any[] } => {
  const matches = sql.match(/{{(.*?)}}/g);
  let paramIndex = 1;
  const params: any[] = [];
  console.log("Matches", matches);
  if (!matches) {
    return { sql, params: [] };
  }
  matches.forEach((match) => {
    const paramName = match.replace("{{", "").replace("}}", "");
    if (parameters[paramName] !== undefined) {
      sql = sql.replace(match, `$${paramIndex}`);
      params.push(parameters[paramName]);
      paramIndex++;
    }
  });

  return { sql, params };
};
