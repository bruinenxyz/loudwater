import { Logger, LoggerErrorInterceptor } from "nestjs-pino";
import { patchNestJsSwagger } from "nestjs-zod";

import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import * as Sentry from "@sentry/node";

import { ZodValidationExceptionFilter } from "./shared/exceptions/filters/zod-validation-exception.filter";

import { AppModule } from "./app.module";
import { setupSwagger } from "./swagger";

patchNestJsSwagger();

const setupSentry = async () => {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.APP_ENV || "development",
      // We recommend adjusting this value in production, or using tracesSampler
      // for finer control
      enableTracing: true,
      tracesSampleRate: 1.0,
      integrations: [new Sentry.Integrations.Http({ tracing: true })],
    });
  }
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    snapshot: process.env.NODE_ENV !== "production",
  });

  const configService = app.get(ConfigService);

  console.log(configService.getOrThrow<string>("allowedCors"));

  // Swagger setup
  setupSwagger(app);
  setupSentry();

  // Enable Exception filters
  app.useGlobalFilters(new ZodValidationExceptionFilter());
  // Enable CORS
  const corsOptions: CorsOptions = {
    origin: [configService.getOrThrow<string>("allowedCors")],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  };
  app.enableCors(corsOptions);
  // Starts listening for shutdown hooks
  app.enableShutdownHooks();

  // Logging
  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  await app.listen(configService.getOrThrow<number>("appPort"));
}
bootstrap();
