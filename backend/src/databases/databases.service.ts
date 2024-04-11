import { PrismaService } from "@/prisma/prisma.service";
import {
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpRequestContextService } from "@/shared/http-request-context/http-request-context.service";
import { CreateDatabase, Database, UpdateDatabase } from "@/definitions";
import { AES } from "crypto-js";
import * as CryptoJS from "crypto-js";
import * as assert from "assert";
import { PostgresAdapterService } from "@/postgres-adapter/postgres-adapter.service";

@Injectable()
export class DatabasesService {
  constructor(
    @Inject(forwardRef(() => PostgresAdapterService))
    private postgresAdapterService: PostgresAdapterService,
    private prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly httpRequestContextService: HttpRequestContextService,
  ) {}

  encrypt(connection_url: string): {
    cypherText: string;
    encryptionVector: string;
  } {
    const iv = CryptoJS.lib.WordArray.random(16);
    const cypherText = AES.encrypt(
      connection_url,
      this.configService.getOrThrow("credentialSecret"),
      {
        iv,
      },
    ).toString();
    const encryptionVector = CryptoJS.enc.Hex.stringify(iv);
    return { cypherText: cypherText, encryptionVector: encryptionVector };
  }

  decrypt(cypherText: string, encryptionVector: string): string {
    const iv = CryptoJS.enc.Hex.parse(encryptionVector);
    const connection_url = AES.decrypt(
      cypherText,
      this.configService.getOrThrow("credentialSecret"),
      {
        iv,
      },
    ).toString(CryptoJS.enc.Utf8);

    return connection_url;
  }

  async getConnectionUrl(id: string): Promise<string> {
    const database = await this.findOne(id);

    if (!database) {
      throw new NotFoundException("Database not found");
    }

    return this.decrypt(database.connection_url, database.encryption_vector);
  }

  async findAll(): Promise<Database[]> {
    const orgId = this.httpRequestContextService.checkAndGetOrgId();

    const databases = await this.prismaService.database.findMany({
      where: {
        deleted_at: null,
        organization_id: orgId,
      },
    });

    return databases;
  }

  async findOne(id: string): Promise<Database | null> {
    const orgId = this.httpRequestContextService.checkAndGetOrgId();

    const database = await this.prismaService.database.findUnique({
      where: {
        id,
        organization_id: orgId,
      },
    });

    if (!database) {
      return null;
    }

    return database;
  }

  async createDatabase(createDatabaseObj: CreateDatabase): Promise<Database> {
    const orgId = this.httpRequestContextService.checkAndGetOrgId();

    // Extract the external name from the URL
    const externalName = createDatabaseObj.connection_url
      .split("/")
      .slice(-1)[0]
      .split("?")[0];

    // Encrypt the Postgres connection URL
    const { cypherText, encryptionVector } = this.encrypt(
      createDatabaseObj.connection_url,
    );

    // Create the database record in DB
    const database = await this.prismaService.database.create({
      data: {
        name: createDatabaseObj.name,
        external_name: externalName,
        require_ssl: createDatabaseObj.require_ssl,
        connection_url: cypherText,
        encryption_vector: encryptionVector,
        organization_id: orgId,
      },
    });

    assert(database, "Database creation error");

    return database;
  }

  async findAllSchemas(databaseId: string): Promise<string[]> {
    const database = await this.findOne(databaseId);

    if (!database) {
      throw new NotFoundException("Database not found");
    }

    const schemas =
      await this.postgresAdapterService.getAllDatabaseSchema(databaseId);

    const systemSchemas = ["information_schema", "pg_catalog", "pg_toast"];

    return schemas.filter((schema) => !systemSchemas.includes(schema));
  }

  async updateDatabase(
    id: string,
    databaseUpdate: UpdateDatabase,
  ): Promise<Database> {
    const orgId = this.httpRequestContextService.checkAndGetOrgId();

    const targetDatabase = await this.prismaService.database.findUnique({
      where: {
        id,
        organization_id: orgId,
      },
    });

    if (!targetDatabase) {
      throw new NotFoundException("Database not found");
    }

    // Update the database record in DB
    const database = await this.prismaService.database.update({
      where: {
        id,
      },
      data: databaseUpdate,
    });

    // Return the updated database record
    return database;
  }

  async deleteDatabase(id: string): Promise<Database> {
    const orgId = this.httpRequestContextService.checkAndGetOrgId();

    const targetDatabase = await this.prismaService.database.findUnique({
      where: {
        id,
        organization_id: orgId,
      },
    });

    if (!targetDatabase) {
      throw new NotFoundException("Database not found");
    }

    // Set deleted_at field in DB
    const database = await this.prismaService.database.update({
      where: {
        id,
      },
      data: {
        deleted_at: new Date(),
      },
    });

    // Return deleted database record
    return database;
  }
}
