import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    return next.handle().pipe(
      tap(() => {
        Logger.log(
          `${context.getType()} ${context.getClass().name} ${
            context.getHandler().name
          } - ${Date.now() - now}ms ${response.statusCode}`,
        );
      }),
    );
  }
}
