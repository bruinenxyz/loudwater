import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "@/prisma/prisma.service";
import { PostgresAdapterService } from "@/postgres-adapter/postgres-adapter.service";
import { HttpRequestContextService } from "@/shared/http-request-context/http-request-context.service";
import {
  CreateTable,
  ExternalColumn,
  HydratedTable,
  HydratedTableSchema,
  Table,
  TableSchema,
  UpdateTable,
  UpdateTableRow,
} from "@/definitions";
import * as assert from "assert";
import * as _ from "lodash";
import {
  FilterStep,
  OperatorsEnum,
  OrderStep,
  TakeStep,
} from "@/definitions/pipeline";
import { QueryResult } from "pg";

@Injectable()
export class TablesService {
  constructor(
    private prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly httpRequestContextService: HttpRequestContextService,
    private readonly postgresAdapterService: PostgresAdapterService,
  ) {}

  async getTableResults(
    id: string,
    filters: FilterStep | null,
    order: OrderStep | null,
    take: TakeStep | null,
  ): Promise<any> {
    const table = await this.findOne(id);
    assert(table, "Table not found");

    // Begin building SQL statement
    let sql = `SELECT * FROM ${table.external_name}`;

    const parameters: string[] = [];

    // Add filters
    if (filters) {
      sql += "\nWHERE ";
      sql += _.map(filters.conditions, (condition) => {
        switch (condition.operator) {
          case OperatorsEnum.isNull:
            return `${condition.property} IS NULL`;
          case OperatorsEnum.isNotNull:
            return `${condition.property} IS NOT NULL`;
          case OperatorsEnum.like:
            //  Use a prepared statement if the value is a string
            if (typeof condition.value === "string") {
              parameters.push(`%${condition.value}%`);
              return `${condition.property} LIKE $${parameters.length}`;
            }
            return `${condition.property} LIKE ${condition.value}`;
          case OperatorsEnum.notLike:
            //  Use a prepared statement if the value is a string
            if (typeof condition.value === "string") {
              parameters.push(`%${condition.value}%`);
              return `${condition.property} NOT LIKE $${parameters.length}`;
            }
            return `${condition.property} NOT LIKE ${condition.value}`;
          case OperatorsEnum.equal:
          case OperatorsEnum.notEqual:
          case OperatorsEnum.greaterThan:
          case OperatorsEnum.lessThan:
          case OperatorsEnum.greaterThanOrEqual:
          case OperatorsEnum.lessThanOrEqual:
            const operator =
              condition.operator === OperatorsEnum.equal
                ? "="
                : condition.operator;
            if (typeof condition.value === "string") {
              return `${condition.property} ${operator} '${condition.value}'`;
            } else {
              return `${condition.property} ${operator} ${condition.value}`;
            }
          default:
            throw new Error(`Unknown operator: ${condition.operator}`);
        }
      }).join(` ${_.toUpper(filters.logicalOperator)} `);
    }

    // Add order clause
    if (order) {
      sql += "\nORDER BY ";
      sql += _.map(order.order, (order) => {
        return order.direction === "desc"
          ? `${order.property} DESC`
          : order.property;
      }).join(", ");
      sql += "\n";
    }

    // Add take clause
    if (take) {
      sql += take.limit ? `\nLIMIT ${take.limit}` : "";
      sql += take.offset ? `\nOFFSET ${take.offset}` : "";
    } else {
      sql += "\nLIMIT 100";
    }

    // If there were prepared statements, turn the SQL into a prepared statement
    if (parameters.length > 0) {
      sql = `PREPARE stmt AS\n${sql};\nEXECUTE stmt(${_.map(
        parameters,
        (param) => `'${param}'`,
      ).join(", ")});`;
    }

    const results = await this.postgresAdapterService.run({
      sql,
      databaseId: table.database_id,
    });

    // Each statement returns a result, but we only care about the last one because the first is the result of the 'PREPARE' statement
    if (parameters.length > 0) {
      return results[1];
    }

    return results;
  }

  async findAllForDatabase(databaseId: string): Promise<HydratedTable[]> {
    const schemas =
      await this.postgresAdapterService.getAllTableSchema(databaseId);

    const orgId = this.httpRequestContextService.checkAndGetOrgId();

    const tables = await this.prismaService.table.findMany({
      where: {
        database_id: databaseId,
        deleted_at: null,
        organization_id: orgId,
      },
    });

    const parsedTables: Table[] = _.map(tables, (table) =>
      TableSchema.parse(table),
    );

    const promises: Promise<HydratedTable>[] = [];

    _.forEach(
      schemas,
      (tableSchema: Record<string, ExternalColumn>, tableName: string) => {
        const existingTable = _.find(
          parsedTables,
          (table) => table.external_name === tableName,
        );

        // Create a new table record if it doesn't exist and push the createTable promise into the promises array
        if (!existingTable) {
          promises.push(
            this.createTable(
              {
                name: tableName,
                external_name: tableName,
                icon: "cube",
                color: "gray",
                configuration: {},
                visibility: "normal",
                database_id: databaseId,
                properties: {},
                permissions: {},
              },
              tableSchema,
            ),
          );
        } else {
          // Otherwise, push a resolved promise into the array
          promises.push(
            Promise.resolve(
              HydratedTableSchema.parse({
                ...existingTable,
                external_columns: tableSchema,
              }),
            ),
          );
        }
      },
    );

    // Wait for all promises to resolve
    const resolvedTables = await Promise.all(promises);

    // Filter out hidden tables
    const results = _.filter(
      resolvedTables,
      (table: HydratedTable) => table.visibility !== "hidden",
    );

    return results;
  }

  async findOne(id: string): Promise<HydratedTable | null> {
    const orgId = this.httpRequestContextService.checkAndGetOrgId();

    const table = await this.prismaService.table.findUnique({
      where: {
        id,
        organization_id: orgId,
      },
    });

    if (!table) {
      return null;
    }

    const schemas = await this.postgresAdapterService.getAllTableSchema(
      table.database_id,
    );

    if (!schemas[table.external_name]) {
      throw new NotFoundException("Table not found in source");
    }

    return HydratedTableSchema.parse({
      ...table,
      external_columns: schemas[table.external_name],
    });
  }

  async createTable(
    createTableObj: CreateTable,
    tableSchema: Record<string, ExternalColumn>,
  ): Promise<HydratedTable> {
    const orgId = this.httpRequestContextService.checkAndGetOrgId();

    // Create the table record in DB
    const table = await this.prismaService.table.create({
      data: {
        name: createTableObj.name,
        external_name: createTableObj.external_name,
        description: createTableObj.description,
        icon: createTableObj.icon,
        color: createTableObj.color,
        configuration: createTableObj.configuration,
        visibility: createTableObj.visibility,
        properties: createTableObj.properties,
        permissions: createTableObj.permissions,
        organization_id: orgId,
        database: {
          connect: {
            id: createTableObj.database_id,
          },
        },
      },
    });

    assert(table, "Table creation error");

    return HydratedTableSchema.parse({
      ...table,
      external_columns: tableSchema,
    });
  }

  async updateTable(
    id: string,
    tableUpdate: UpdateTable,
  ): Promise<HydratedTable> {
    const orgId = this.httpRequestContextService.checkAndGetOrgId();

    const targetTable = await this.prismaService.table.findUnique({
      where: {
        id,
        organization_id: orgId,
      },
    });

    if (!targetTable) {
      throw new NotFoundException("Table not found");
    }

    // Update the table record in DB
    const table = await this.prismaService.table.update({
      where: {
        id,
      },
      data: tableUpdate,
    });

    // Pull the table schemas for this DB
    const schemas = await this.postgresAdapterService.getAllTableSchema(
      table.database_id,
    );

    // Return the updated table record including hydrated schema
    return HydratedTableSchema.parse({
      ...table,
      external_columns: schemas[table.external_name],
    });
  }

  async getTablePk(
    id: string,
  ): Promise<QueryResult<{ column_name: string; column_type: string }>> {
    const table = await this.findOne(id);
    assert(table, "Table not found");

    const pk = await this.postgresAdapterService.run({
      databaseId: table.database_id,
      sql: `SELECT c.column_name, c.data_type
      FROM information_schema.table_constraints tc 
      JOIN information_schema.constraint_column_usage AS ccu USING (constraint_schema, constraint_name) 
      JOIN information_schema.columns AS c ON c.table_schema = tc.constraint_schema
        AND tc.table_name = c.table_name AND ccu.column_name = c.column_name
      WHERE constraint_type = 'PRIMARY KEY' and tc.table_name = '${table.external_name}';`,
    });
    return pk;
  }

  async deleteTable(id: string): Promise<HydratedTable> {
    const orgId = this.httpRequestContextService.checkAndGetOrgId();

    const targetTable = await this.prismaService.table.findUnique({
      where: {
        id,
        organization_id: orgId,
      },
    });

    if (!targetTable) {
      throw new NotFoundException("Table not found");
    }

    // Set deleted_at field in DB
    const table = await this.prismaService.table.update({
      where: {
        id,
      },
      data: {
        deleted_at: new Date(),
      },
    });

    const schemas = await this.postgresAdapterService.getAllTableSchema(
      table.database_id,
    );

    return HydratedTableSchema.parse({
      ...table,
      external_columns: schemas[table.external_name],
    });
  }

  async updateTableRow(
    tableId: string,
    params: UpdateTableRow,
  ): Promise<QueryResult> {
    const { pk_column, column_name, value, row_id } = params;
    const table = await this.findOne(tableId);
    assert(table, "Table not found");

    const sql = `UPDATE ${table.external_name} SET ${column_name} = $1 WHERE ${pk_column} = $2`;
    const parameters = [value, row_id];

    const result = await this.postgresAdapterService.run({
      sql,
      values: parameters,
      databaseId: table.database_id,
    });

    return result;
  }
}
