import { createParamDecorator, ExecutionContext } from "@nestjs/common";

const UNAUTHENTICATED_ORG = "UNAUTHENTICATED_ORG";

export const OrganizationId = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    if (process.env.USE_AUTH !== "true") {
      // have to access process to env specifically (can't use config service in decorator)
      return UNAUTHENTICATED_ORG;
    }
    return request.auth.orgId;
  },
);
