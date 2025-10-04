import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (response.headersSent) {
      return;
    }

    let errors: { field: string; errors: string[] }[] = [];

    if (exception instanceof HttpException) {
      const res = exception.getResponse() as
        | { message: string | string[]; error?: string }
        | string;

      let messages: string[] = [];

      if (Array.isArray(res)) {
        messages = res;
      } else if (typeof res === 'object' && 'message' in res) {
        messages = Array.isArray(res.message) ? res.message : [res.message];
      } else if (typeof res === 'string') {
        messages = [res];
      }

      errors = messages.map((msg) => ({
        field: msg.split(' ')[0],
        errors: [msg],
      }));
    }

    //@ts-ignore
    request.flash('error', errors);
    //@ts-ignore
    request.flash('oldInput', request.body);

    const referer = request.headers.referer || '/';
    return response.redirect(referer);
  }
}
