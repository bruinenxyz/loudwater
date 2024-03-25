import { Request } from "express";

import { Clerk } from "@clerk/backend";
import { ClerkClient } from "@clerk/clerk-sdk-node/dist/types/types";
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { AllowUnauthenticated } from "./unauthenticated.decorator";

@Injectable()
export class AuthGuard implements CanActivate {
  clerkClient?: ClerkClient;
  logger = new Logger(AuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {
    if (this.configService.get("useAuth")) {
      this.clerkClient = Clerk({
        secretKey: this.configService.get("clerkSecretKey"),
      });

      this.logger.log(this.clerkClient);
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.configService.get("useAuth")) {
      return true;
    }
    // workaround for dataset endpoints needed by query engine
    // TODO: improve/refactor query engine to no longer need to connect to the backend
    const allowUnauthenticatedRequests = this.reflector.getAllAndOverride(
      AllowUnauthenticated,
      [context.getHandler(), context.getClass()],
    );
    if (allowUnauthenticatedRequests) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const auth = request.auth;
    if (!auth.userId) {
      return false;
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
