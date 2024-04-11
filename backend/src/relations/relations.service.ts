import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { HttpRequestContextService } from "@/shared/http-request-context/http-request-context.service";
import { CreateRelationDto, UpdateRelationDto } from "./dtos/relation.dto";
import { PostgresAdapterService } from "@/postgres-adapter/postgres-adapter.service";
import * as assert from "assert";
import * as _ from "lodash";
import { Relation, RelationSchema, RelationType } from "@/definitions";
import { TablesService } from "@/tables/tables.service";

@Injectable()
export class RelationsService {
  constructor(
    private prismaService: PrismaService,
    private readonly httpRequestContextService: HttpRequestContextService,
    private readonly postgresAdapterService: PostgresAdapterService,
    private readonly tablesService: TablesService,
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

    return RelationSchema.parse(relation);
  }

  async findAllForDatabase(databaseId: string) {
    const orgId = this.httpRequestContextService.checkAndGetOrgId();

    // Pull user-created relations from the db
    const existingRelations = await this.prismaService.relation.findMany({
      where: {
        database_id: databaseId,
        deleted_at: null,
        organization_id: orgId,
      },
    });
    const parsedExistingRelations = _.map(existingRelations, (relation) =>
      RelationSchema.parse(relation),
    );

    // Pull relations from fk constraints in the external db
    const externalConstraints =
      await this.postgresAdapterService.getAllDatabaseConstraints(databaseId);

    const tables = await this.tablesService.findAllForDatabase(databaseId);

    const promises: Promise<Relation>[] = [];

    _.forEach(externalConstraints, (constraint) => {
      if (constraint.constraint_type === "FOREIGN KEY") {
        const table1 = _.find(tables, (table) => {
          return (
            table.schema === constraint.foreign_schema_name &&
            table.external_name === constraint.foreign_table_name
          );
        });

        const table2 = _.find(tables, (table) => {
          return (
            table.schema === constraint.table_schema &&
            table.external_name === constraint.table_name
          );
        });

        if (table1 && table2) {
          // To determine the relation type, check for uniqueness of the current column
          // If the column is unique, then the relation is one-to-one (otherwise it’s one-to-many)
          const isUnique = _.some(externalConstraints, (c) => {
            return (
              c.table_name === constraint.table_name &&
              c.column_name === constraint.column_name &&
              (c.constraint_type === "UNIQUE" ||
                c.constraint_type === "PRIMARY KEY")
            );
          });

          const relationType = (
            isUnique ? "one_to_one" : "one_to_many"
          ) as RelationType;

          const foundConstraint = _.find(
            parsedExistingRelations,
            (relation) => {
              return (
                relation.table_1 === table1.id &&
                relation.table_2 === table2.id &&
                relation.column_1 === constraint.foreign_column_name &&
                relation.column_2 === constraint.column_name &&
                relation.type === relationType
              );
            },
          );

          // If the relation isn't found, add it in the db
          if (!foundConstraint) {
            const newRelation = {
              database_id: databaseId,
              type: relationType,
              generated: true,
              table_1: table1.id,
              table_2: table2.id,
              column_1: constraint.foreign_column_name,
              column_2: constraint.column_name,
            };

            promises.push(this.create(newRelation));
          }
        }
      }
    });

    const newRelations: Relation[] = await Promise.all(promises);
    const allRelations = _.concat(parsedExistingRelations, newRelations);

    return allRelations;
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
