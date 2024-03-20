import {
  CanActivate,
  ExecutionContext,
  Injectable,
  mixin,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "src/prisma/prisma.service";
import { Reflector } from "@nestjs/core";

export const OrgGuard = (table: string) => {
  @Injectable()
  class OrganizationsGuardMixin implements CanActivate {
    constructor(
      private reflector: Reflector,
      private readonly configService: ConfigService,
      public prismaService: PrismaService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const { auth, params } = request; // Add method and url to log below
      const { orgId } = auth;

      const resource = await this.prismaService[table].findUnique({
        where: {
          id: params.id,
        },
      });

      if (resource?.organization_id === orgId) {
        // console.log("PASS -", method, url);
        return true;
      }

      // console.log("FAIL -", method, url, "orgId", orgId, "resource", resource);
      return false;
    }
  }

  // Needed <any> to silence error
  const guard = <any>mixin(OrganizationsGuardMixin);
  return guard;
};
