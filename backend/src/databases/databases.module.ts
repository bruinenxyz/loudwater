import { Module, forwardRef } from "@nestjs/common";
import { DatabasesService } from "./databases.service";
import { DatabasesController } from "./databases.controller";
import { PostgresAdapterModule } from "@/postgres-adapter/postgres-adapter.module";

@Module({
  imports: [forwardRef(() => PostgresAdapterModule)],
  controllers: [DatabasesController],
  providers: [DatabasesService],
  exports: [DatabasesService],
})
export class DatabasesModule {}
