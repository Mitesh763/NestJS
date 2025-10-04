import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { randomUUID } from 'crypto';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    // const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? (exception.getResponse() as any)
        : 'Internal Server Error';

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : exceptionResponse.message || 'Internal Server Error';

    const error =
      typeof exceptionResponse === 'string'
        ? 'Internal Server Error'
        : exceptionResponse.error;

    const payload =
      exceptionResponse.payload ||
      (exceptionResponse.message instanceof Array
        ? exceptionResponse.message
        : null);

    response.status(status).json({
      requestId: randomUUID(),
      success: false,
      code: status,
      message: message,
      messageLBL: error,
      payload: payload,
    });
  }
}
