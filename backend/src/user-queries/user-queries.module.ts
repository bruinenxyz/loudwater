import { Module } from "@nestjs/common";
import { UserQueriesService } from "./user-queries.service";
import { UserQueriesController } from "./user-queries.controller";
import { PostgresAdapterModule } from "@/postgres-adapter/postgres-adapter.module";

@Module({
  controllers: [UserQueriesController],
  imports: [PostgresAdapterModule],
  providers: [UserQueriesService],
})
export class UserQueriesModule {}
