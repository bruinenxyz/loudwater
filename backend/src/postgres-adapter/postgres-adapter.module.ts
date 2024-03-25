import { Module } from "@nestjs/common";
import { PostgresAdapterService } from "./postgres-adapter.service";
import { DatabasesModule } from "@/databases/databases.module";

@Module({
  imports: [DatabasesModule],
  providers: [PostgresAdapterService],
  exports: [PostgresAdapterService],
})
export class PostgresAdapterModule {}
