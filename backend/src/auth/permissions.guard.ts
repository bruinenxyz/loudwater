import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Permissions } from "./permissions.decorator";
import { ConfigService } from "@nestjs/config";
import * as _ from "lodash";
import { AllowUnauthenticated } from "./unauthenticated.decorator";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.get(
      Permissions,
      context.getHandler(),
    );
    const allowUnauthenticatedRequests = this.reflector.getAllAndOverride(
      AllowUnauthenticated,
      [context.getHandler(), context.getClass()],
    );
    if (allowUnauthenticatedRequests) {
      return true;
    }
    if (!requiredPermission) {
      return true;
    }
    const { auth } = context.switchToHttp().getRequest();
    const userPermissions = auth.sessionClaims.org_permissions;

    if (_.includes(userPermissions, requiredPermission)) {
      return true;
    }
    return false;
  }
}
