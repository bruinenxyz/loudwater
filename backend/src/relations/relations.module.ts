import { Module } from "@nestjs/common";
import { RelationsService } from "./relations.service";
import { RelationsController } from "./relations.controller";
import { PostgresAdapterModule } from "@/postgres-adapter/postgres-adapter.module";

@Module({
  controllers: [RelationsController],
  providers: [RelationsService],
  imports: [PostgresAdapterModule],
})
export class RelationsModule {}
