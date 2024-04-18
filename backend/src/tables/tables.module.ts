import { Module } from "@nestjs/common";
import { TablesService } from "./tables.service";
import { TablesController } from "./tables.controller";
import { PostgresAdapterModule } from "@/postgres-adapter/postgres-adapter.module";
import { LlmsModule } from "@/llms/llms.module";

@Module({
  imports: [PostgresAdapterModule, LlmsModule],
  controllers: [TablesController],
  providers: [TablesService],
  exports: [TablesService],
})
export class TablesModule {}
