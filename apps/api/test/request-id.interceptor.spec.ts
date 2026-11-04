import { of } from 'rxjs';
import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { RequestIdInterceptor } from '../src/common/request-id.interceptor';

describe('RequestIdInterceptor', () => {
  it('uses the current request ID in response metadata', (done) => {
    const interceptor = new RequestIdInterceptor();
    const context = { switchToHttp: () => ({ getRequest: () => ({ requestId: 'request-123' }) }) } as unknown as ExecutionContext;
    const next = { handle: () => of({ data: { ok: true }, meta: { requestId: 'static-id', other: 'kept' } }) } as CallHandler;

    interceptor.intercept(context, next).subscribe({
      next: (value) => expect(value).toEqual({ data: { ok: true }, meta: { requestId: 'request-123', other: 'kept' } }),
      complete: done,
    });
  });
});
