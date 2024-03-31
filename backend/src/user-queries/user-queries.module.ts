import { Module } from "@nestjs/common";
import { UserQueriesService } from "./user-queries.service";
import { UserQueriesController } from "./user-queries.controller";
import { PostgresAdapterModule } from "@/postgres-adapter/postgres-adapter.module";
import { TablesModule } from "@/tables/tables.module";

@Module({
  controllers: [UserQueriesController],
  imports: [PostgresAdapterModule, TablesModule],
  providers: [UserQueriesService],
})
export class UserQueriesModule {}
