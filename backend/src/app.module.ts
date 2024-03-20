import { LoggerModule } from "nestjs-pino";
import { ZodSerializerInterceptor, ZodValidationPipe } from "nestjs-zod";
import { ClerkExpressWithAuth } from "@clerk/clerk-sdk-node";
import {
  ExecutionContext,
  MiddlewareConsumer,
  Module,
  NestModule,
} from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { configurationFactory } from "./shared/configs/configuration-factory";
import { HttRequestContextMiddleware } from "./shared/http-request-context/http-request-context.middleware";
import { HttpRequestContextModule } from "./shared/http-request-context/http-request-context.module";
import loggerModuleParams from "./shared/logger/logger-module-params";
import { RequestIdHeaderMiddleware } from "./shared/middlewares/request-id-header.middleware";
import { AuthModule } from "./auth/auth.module";
import { PermissionsGuard } from "./auth/permissions.guard";
import { AuthGuard } from "./auth/auth.guard";
import { JwtModule } from "@nestjs/jwt";
import { DevtoolsModule } from "@nestjs/devtools-integration";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { TrackingService } from "./tracking/tracking.service";
import { RavenModule } from "nest-raven";
import { RavenInterceptor } from "nest-raven";
import { Scope } from "@sentry/node";
import { DatabasesModule } from "./databases/databases.module";
import { TablesModule } from "./tables/tables.module";
import { UserQueriesModule } from "./user-queries/user-queries.module";
import * as _ from "lodash";
import { PostgresAdapterModule } from "./postgres-adapter/postgres-adapter.module";
import { AuthMiddleware } from "./shared/middlewares/auth.middleware";

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [configurationFactory], // TODO do config validation based on expected schema
    }),
    DevtoolsModule.register({
      port: 3001,
      http: process.env.NODE_ENV !== "production",
    }),
    PrismaModule,
    RavenModule,
    EventEmitterModule.forRoot(),
    JwtModule,
    AuthModule,
    HttpRequestContextModule,
    LoggerModule.forRootAsync(loggerModuleParams),
    DatabasesModule,
    TablesModule,
    UserQueriesModule,
    PostgresAdapterModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
    {
      provide: APP_INTERCEPTOR,
      useValue: new RavenInterceptor({
        transformers: [
          (scope: Scope, context: ExecutionContext) => {
            const request = context.switchToHttp().getRequest();
            const traceId = _.split(
              request.headers["sentry-trace"] || "",
              "-",
            )[0];
            scope.setPropagationContext({
              traceId: traceId,
              spanId: scope.getPropagationContext()?.spanId,
            });
            scope.setUser({
              id: request.auth?.userId,
              orgId: request.auth?.orgId,
              orgSlug: request.auth?.orgSlug,
              orgRole: request.auth?.orgRole,
              email: request.auth?.claims.primary_email_address,
            });
          },
        ],
      }),
    },
    TrackingService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        // The order is very important to have auth object injected to Request Object
        process.env.USE_AUTH === "true"
          ? ClerkExpressWithAuth()
          : AuthMiddleware,

        RequestIdHeaderMiddleware,
        HttRequestContextMiddleware,
      )
      .exclude("/datasets/*")
      .forRoutes("*");
  }
}
