import { Global, Module } from "@nestjs/common";
import { HttpRequestContextService } from "./http-request-context.service";
import { HttRequestContextMiddleware } from "./http-request-context.middleware";

@Global()
@Module({
  providers: [HttpRequestContextService, HttRequestContextMiddleware],
  exports: [HttpRequestContextService, HttRequestContextMiddleware],
})
export class HttpRequestContextModule {}
