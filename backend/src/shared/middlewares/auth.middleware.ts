import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NextFunction } from "express";
import _ from "lodash";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}
  private readonly logger = new Logger(AuthMiddleware.name);

  use(req: Request, _res: Response, next: NextFunction) {
    const orgId = this.configService.getOrThrow("orgId");
    req["auth"] = { userId: "default", orgId: orgId, orgRole: "admin" };
    next();
  }
}
