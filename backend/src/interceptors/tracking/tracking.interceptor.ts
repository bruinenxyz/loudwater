import { HttpRequestContextService } from "@/shared/http-request-context/http-request-context.service";
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Observable, tap } from "rxjs";

@Injectable()
export class TrackingInterceptor implements NestInterceptor {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly httpRequestContextService: HttpRequestContextService,
  ) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const {
      method: httpMethod,
      url,
      path,
      body: requestBody,
    } = context.switchToHttp().getRequest();

    const controller = context.getClass().name;
    const controllerMethod = context.getHandler().name;

    return next.handle().pipe(
      tap((response) => {
        const requestId = this.httpRequestContextService.checkAndGetRequestId();
        const orgId = this.httpRequestContextService.checkAndGetOrgId();
        const userId = this.httpRequestContextService.checkAndGetUserId();
        const orgRole = this.httpRequestContextService.checkAndGetOrgRole();

        this.eventEmitter.emit("trackingEvent", {
          requestId,
          orgId,
          userId,
          orgRole,
          httpMethod,
          url,
          path,
          controller,
          controllerMethod,
          requestBody,
          response,
        });
      }),
    );
  }
}
