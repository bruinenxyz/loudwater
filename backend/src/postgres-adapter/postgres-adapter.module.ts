import { Module, forwardRef } from "@nestjs/common";
import { PostgresAdapterService } from "./postgres-adapter.service";
import { DatabasesModule } from "@/databases/databases.module";

@Module({
  imports: [forwardRef(() => DatabasesModule)],
  providers: [PostgresAdapterService],
  exports: [PostgresAdapterService],
})
export class PostgresAdapterModule {}
