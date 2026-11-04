import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import type { ApiRequest } from './request.types';

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<ApiRequest>();
    return next.handle().pipe(map((body: unknown) => {
      if (!body || typeof body !== 'object' || !('meta' in body)) return body;
      const response = body as { meta?: Record<string, unknown> };
      return { ...body, meta: { ...response.meta, requestId: request.requestId ?? 'unknown' } };
    }));
  }
}
