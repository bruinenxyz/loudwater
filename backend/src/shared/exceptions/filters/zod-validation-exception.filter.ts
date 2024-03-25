import { Request, Response } from "express";
import { ZodValidationException } from "nestjs-zod";

import { HEADER } from "@/shared/constant/request";
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";

@Catch(ZodValidationException)
export class ZodValidationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ZodValidationExceptionFilter.name);
  catch(exception: ZodValidationException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Get exception information
    let status: number;
    let message: string;
    let httpExceptionResponse: unknown;
    if (exception instanceof HttpException) {
      // Standard expcetion by NestJs framework
      const httpException = exception as HttpException;
      status = httpException.getStatus();
      message = httpException.message;
      httpExceptionResponse = httpException.getResponse();
    } else {
      // Generic exception.
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = "Intenal server error";
    }

    this.logger.error(
      "Exception filter catch %s with message: %s httpExceptionResponse %j. Stack %s",
      (exception as Error).name,
      (exception as Error).message,
      httpExceptionResponse,
      (exception as Error).stack,
    );
    // Need to send response if it is Rest API calling. Graphql is no need
    if (response) {
      const responseBody = {
        request_id: request.headers[HEADER.X_REQUEST_ID] as string,
        message,
        httpExceptionResponse,
      };
      this.logger.log(
        "Responding with status: %s and body: %j",
        status,
        responseBody,
      );
      response.status(status).json(responseBody);
    }
  }
}
