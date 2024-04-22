import { DatabasesService } from "@/databases/databases.service";
import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { Pool } from "pg";
import { ExternalColumn } from "@/definitions/postgres-adapter";
import * as assert from "assert";
import { SYSTEM_SCHEMAS } from "@/shared/constant/database";

interface CreateDatabaseQueryDto {
  databaseId: string;
  sql: string;
  values?: any[];
}

const mapColumnType = (type: string): string => {
  switch (type) {
    case "USER-DEFINED":
      return "enum";
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
  constructor(
    @Inject(forwardRef(() => DatabasesService))
    private readonly databaseService: DatabasesService,
  ) {}

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
  ): Promise<Record<string, Record<string, Record<string, ExternalColumn>>>> {
    const database = await this.databaseService.findOne(databaseId);
    const client = await this.getClientForDatabase(databaseId);
    assert(database, "Database not found");

    try {
      const result = await client.query(
        `SELECT * FROM information_schema.columns`,
      );

      // Build a map of schemata to tables to columns
      const columns = result.rows;
      const columnMap = {};
      for (const column of columns) {
        if (SYSTEM_SCHEMAS.includes(column.table_schema)) continue;

        if (!columnMap[column.table_schema]) {
          columnMap[column.table_schema] = {};
        }

        if (!columnMap[column.table_schema][column.table_name]) {
          columnMap[column.table_schema][column.table_name] = {};
        }

        columnMap[column.table_schema][column.table_name][column.column_name] =
          columnMapping(column);
      }

      return columnMap;
    } catch (e) {
      console.log(e);
      throw e;
    } finally {
      client.release();
    }
  }

  async getAllDatabaseSchema(databaseId: string): Promise<string[]> {
    const database = await this.databaseService.findOne(databaseId);
    const client = await this.getClientForDatabase(databaseId);
    assert(database, "Database not found");

    try {
      const result = await client.query(
        `SELECT schema_name FROM information_schema.schemata`,
      );
      const columns = result.rows;
      const schemata = columns
        .map((column) => column.schema_name)
        .filter((schema) => !SYSTEM_SCHEMAS.includes(schema));

      return schemata;
    } catch (e) {
      console.log(e);
      throw e;
    } finally {
      client.release();
    }
  }

  async getAllDatabaseConstraints(databaseId: string): Promise<any> {
    const database = await this.databaseService.findOne(databaseId);
    const client = await this.getClientForDatabase(databaseId);
    assert(database, "Database not found");

    try {
      const result = await client.query(
        `SELECT
          tc.constraint_name,
          tc.constraint_type,
          tc.table_name,
          tc.table_schema,
          kcu.column_name,
          ccu.table_schema AS foreign_schema_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM 
          information_schema.table_constraints AS tc
        JOIN 
          information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        LEFT JOIN 
          information_schema.constraint_column_usage AS ccu
          ON tc.constraint_name = ccu.constraint_name
          AND tc.table_schema = ccu.table_schema
        WHERE 
          tc.constraint_type IN ('FOREIGN KEY', 'PRIMARY KEY', 'UNIQUE');`,
      );

      return result.rows;
    } catch (e) {
      console.log(e);
      throw e;
    } finally {
      client.release();
    }
  }
}
