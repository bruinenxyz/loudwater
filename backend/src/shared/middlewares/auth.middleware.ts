import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { NextFunction } from "express";
import _ from "lodash";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name);

  use(req: Request, _res: Response, next: NextFunction) {
    req["auth"] = { userId: "default", orgId: "default", orgRole: "admin" };
    next();
  }
}
