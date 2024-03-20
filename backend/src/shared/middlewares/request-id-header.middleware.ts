import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { NextFunction } from "express";

import { HEADER } from "../constant/request";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const KSUID = require("ksuid");

@Injectable()
export class RequestIdHeaderMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestIdHeaderMiddleware.name);

  use(req: Request, _res: Response, next: NextFunction) {
    req.headers[HEADER.X_REQUEST_ID] =
      req.headers[HEADER.X_REQUEST_ID] || `rqst_${KSUID.randomSync().string}`;
    next();
  }
}
