import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { HttpRequestContextService } from "@/shared/http-request-context/http-request-context.service";
import { CreateRelationDto, UpdateRelationDto } from "./dtos/relation.dto";
import { PostgresAdapterService } from "@/postgres-adapter/postgres-adapter.service";
import * as assert from "assert";
import * as _ from "lodash";
import { RelationSchema } from "@/definitions";

@Injectable()
export class RelationsService {
  constructor(
    private prismaService: PrismaService,
    private readonly httpRequestContextService: HttpRequestContextService,
    private readonly postgresAdapterService: PostgresAdapterService,
  ) {}

  async create(createRelationDto: CreateRelationDto) {
    const orgId = this.httpRequestContextService.checkAndGetOrgId();

    const relation = await this.prismaService.relation.create({
      data: {
        ...createRelationDto,
        organization_id: orgId,
        deleted_at: null,
      },
    });

    return relation;
  }

  async findAllForDatabase(databaseId: string) {
    const orgId = this.httpRequestContextService.checkAndGetOrgId();

    // Pull user-created relations from the db
    const relations = await this.prismaService.relation.findMany({
      where: {
        database_id: databaseId,
        deleted_at: null,
        organization_id: orgId,
      },
    });

    // Pull relations from fk constraints in the external db
    const externalConstraints =
      await this.postgresAdapterService.getAllDatabaseConstraints(databaseId);

    // TODO look through for foreign key constraints and create relations from them
    // We’re checking for one-to-one and one-to-many relations
    // To find a one-to-many relation, we check for a foreign key constraint in the db
    // - If we find one, then the foreign column will be the “one” side of the one-to-many relation
    // - In the case where the *same* column on the base table with the fk constraint has *either* a unique or a primary key constraint, then the relation will be one-to-one

    console.log(externalConstraints);

    // TODO combine the other relations with the current relations

    return relations;
  }

  async findOne(id: string) {
    const orgId = this.httpRequestContextService.checkAndGetOrgId();

    const relation = await this.prismaService.relation.findUnique({
      where: {
        id,
        organization_id: orgId,
      },
    });

    return relation;
  }

  async update(id: string, updateRelationDto: UpdateRelationDto) {
    const orgId = this.httpRequestContextService.checkAndGetOrgId();

    const targetRelation = await this.prismaService.relation.findUnique({
      where: {
        id,
        organization_id: orgId,
        deleted_at: null,
      },
    });

    assert(
      targetRelation,
      new NotFoundException(`Relation not found with id ${id}`),
    );

    const updateRelation = _.merge(targetRelation, updateRelationDto);

    const relation = await this.prismaService.relation.update({
      where: {
        id,
      },
      data: updateRelation,
    });

    return RelationSchema.parse(relation);
  }

  async delete(id: string) {
    const orgId = this.httpRequestContextService.checkAndGetOrgId();

    const targetRelation = await this.prismaService.relation.findUnique({
      where: {
        id,
        organization_id: orgId,
        deleted_at: null,
      },
    });

    assert(
      targetRelation,
      new NotFoundException(`Relation not found with id ${id}`),
    );

    const relation = await this.prismaService.relation.update({
      where: {
        id,
      },
      data: {
        deleted_at: new Date(),
      },
    });

    return RelationSchema.parse(relation);
  }
}
