import { Module } from "@nestjs/common";
import { TablesService } from "./tables.service";
import { TablesController } from "./tables.controller";
import { PostgresAdapterModule } from "@/postgres-adapter/postgres-adapter.module";

@Module({
  imports: [PostgresAdapterModule],
  controllers: [TablesController],
  providers: [TablesService],
  exports: [TablesService],
})
export class TablesModule {}
