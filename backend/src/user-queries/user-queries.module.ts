import { Module } from "@nestjs/common";
import { UserQueriesService } from "./user-queries.service";
import { UserQueriesController } from "./user-queries.controller";
import { PostgresAdapterModule } from "@/postgres-adapter/postgres-adapter.module";
import { TablesModule } from "@/tables/tables.module";
import { RelationsModule } from "@/relations/relations.module";

@Module({
  controllers: [UserQueriesController],
  imports: [PostgresAdapterModule, RelationsModule, TablesModule],
  providers: [UserQueriesService],
})
export class UserQueriesModule {}
