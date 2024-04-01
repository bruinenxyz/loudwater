import { Module } from "@nestjs/common";
import { RelationsService } from "./relations.service";
import { RelationsController } from "./relations.controller";
import { PostgresAdapterModule } from "@/postgres-adapter/postgres-adapter.module";
import { TablesModule } from "@/tables/tables.module";

@Module({
  controllers: [RelationsController],
  providers: [RelationsService],
  imports: [PostgresAdapterModule, TablesModule],
})
export class RelationsModule {}
