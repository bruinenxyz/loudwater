import { DatabasesService } from "@/databases/databases.service";
import { Injectable } from "@nestjs/common";
import { Pool } from "pg";
import { ExternalColumn } from "@/definitions/postgres-adapter";
import * as assert from "assert";

interface CreateDatabaseQueryDto {
  databaseId: string;
  sql: string;
  values?: any[];
}

const mapColumnType = (type: string): string => {
  switch (type) {
    case "integer":
      return "number";
    case "double precision":
      return "float";
    case "boolean":
      return "boolean";
    case "timestamp with time zone":
    case "timestamp without time zone":
      return "datetime";
    case "date":
      return "date";
    case "text":
    case "character":
    case "character varying":
    default:
      return "string";
  }
};

const columnMapping = (column: any): ExternalColumn => {
  return {
    name: column.column_name,
    type: mapColumnType(column.data_type),
    is_nullable: column.is_nullable === "YES",
    default_expression: column.column_default,
    is_updateable: column.is_updatable === "YES",
    is_identity: column.is_identity === "YES",
  };
};

@Injectable()
export class PostgresAdapterService {
  private connectionPool: Map<string, Pool> = new Map();
  constructor(private readonly databaseService: DatabasesService) {}

  async getClientForDatabase(databaseId: string) {
    let connectionString =
      await this.databaseService.getConnectionUrl(databaseId);

    // TODO make this an option on the database
    connectionString += "?sslmode=no-verify";

    if (!this.connectionPool.has(databaseId)) {
      this.connectionPool.set(databaseId, new Pool({ connectionString }));
    }

    const pool = this.connectionPool.get(databaseId);

    assert(pool);

    return pool.connect();
  }
  async run(createDatabaseQueryDto: CreateDatabaseQueryDto) {
    const client = await this.getClientForDatabase(
      createDatabaseQueryDto.databaseId,
    );

    try {
      const result = await client.query(
        createDatabaseQueryDto.sql,
        createDatabaseQueryDto.values,
      );
      return result;
    } catch (e) {
      console.log(e);
      throw e;
    } finally {
      client.release();
    }
  }

  async getAllTableSchema(
    databaseId: string,
  ): Promise<Record<string, Record<string, ExternalColumn>>> {
    const database = await this.databaseService.findOne(databaseId);
    const client = await this.getClientForDatabase(databaseId);
    assert(database, "Database not found");

    try {
      const result = await client.query(
        `SELECT 
        *
        FROM 
        information_schema.columns
        WHERE 
        table_schema = $1;`,
        [database.schema || "public"],
      );

      // map returned columns into tables
      const columns = result.rows;
      const tables = {};
      for (const column of columns) {
        if (!tables[column.table_name]) {
          tables[column.table_name] = {};
        }
        tables[column.table_name][column.column_name] = columnMapping(column);
      }
      return tables;
    } catch (e) {
      console.log(e);
      throw e;
    } finally {
      client.release();
    }
  }
}
