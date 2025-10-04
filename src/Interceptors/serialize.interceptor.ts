import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface DtoClass {
  new (...args: any[]): {};
}

export function Serialize(dto: DtoClass) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: DtoClass) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<DtoClass>,
  ): Observable<any> {
    return next.handle().pipe(
      map((data: DtoClass) => {
        return plainToClass(this.dto, data, {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}
