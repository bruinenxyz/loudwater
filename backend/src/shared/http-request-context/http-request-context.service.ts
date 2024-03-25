import { ForbiddenException, Injectable, Logger } from "@nestjs/common";
import { AsyncLocalStorage } from "async_hooks";
import { NextFunction, Request, Response } from "express";
import { HEADER } from "../constant/request";
import type { AuthObject } from "@clerk/clerk-sdk-node";
import * as _ from "lodash";

export class HttpRequestContext {
  constructor(
    public requestId: string,
    public userId: string,
    public orgId: string,
    public orgRole: string,
    public traceId?: string,
  ) {}
}

@Injectable()
export class HttpRequestContextService {
  private static asyncLocalStorage =
    new AsyncLocalStorage<HttpRequestContext>();

  private readonly logger = new Logger(HttpRequestContextService.name);

  runWithContext(
    req: Request & { auth: AuthObject },
    _res: Response,
    next: NextFunction,
  ) {
    const traceIdHeader = req.headers["sentry-trace"] as string;
    const traceId = _.split(traceIdHeader || "", "-")[0];
    const requestId = req.headers[HEADER.X_REQUEST_ID] as string;
    const userId = req.auth.userId as string;
    const orgId = req.auth.orgId as string;
    const orgRole = req.auth.orgRole as string;
    const context = new HttpRequestContext(
      requestId,
      userId,
      orgId,
      orgRole,
      traceId,
    );
    this.logger.debug("----- Run with context %j", context);

    HttpRequestContextService.asyncLocalStorage.run(context, () => {
      next();
    });
  }

  setRequestId(id: string) {
    const reqContext = HttpRequestContextService.asyncLocalStorage.getStore();

    if (reqContext) {
      this.logger.debug(`-----Context BEFORE is %j`, reqContext);
      reqContext.requestId = id;
      this.logger.debug(`-----Context AFTER is %j`, reqContext);
    } else {
      this.logger.debug("-----Context not found");
    }
  }

  checkAndGetRequestId() {
    const reqContext = HttpRequestContextService.asyncLocalStorage.getStore();

    if (!reqContext) {
      throw new Error("Context not found");
    }

    return reqContext.requestId;
  }

  checkAndGetUserId() {
    const reqContext = HttpRequestContextService.asyncLocalStorage.getStore();

    if (!reqContext || !reqContext.userId) {
      throw new ForbiddenException("User not found");
    }

    return reqContext.userId;
  }

  checkAndGetOrgId() {
    const reqContext = HttpRequestContextService.asyncLocalStorage.getStore();

    if (!reqContext || !reqContext.orgId) {
      throw new ForbiddenException("Organization not found");
    }

    return reqContext.orgId;
  }

  checkAndGetOrgRole() {
    const reqContext = HttpRequestContextService.asyncLocalStorage.getStore();

    if (!reqContext || !reqContext.orgRole) {
      throw new ForbiddenException("Organization role not found");
    }

    return reqContext.orgRole;
  }

  getTraceId() {
    const reqContext = HttpRequestContextService.asyncLocalStorage.getStore();

    if (!reqContext || !reqContext.traceId) {
      return null;
    }

    return reqContext.traceId;
  }
}
