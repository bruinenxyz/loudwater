import { AuthObject } from "@clerk/clerk-sdk-node";
import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { HttpRequestContextService } from "src/shared/http-request-context/http-request-context.service";

@Injectable()
export class HttRequestContextMiddleware implements NestMiddleware {
  private readonly logger = new Logger(HttRequestContextMiddleware.name);

  constructor(private readonly service: HttpRequestContextService) {}

  use(req: Request & { auth: AuthObject }, res: Response, next: NextFunction) {
    this.service.runWithContext(req, res, next);
  }
}
