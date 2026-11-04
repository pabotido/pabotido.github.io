import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import type { ApiRequest } from './request.types';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const request = host.switchToHttp().getRequest<ApiRequest>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : undefined;
    const message = typeof exceptionResponse === 'object' && exceptionResponse && 'message' in exceptionResponse ? exceptionResponse.message : 'Đã xảy ra lỗi máy chủ';
    const details = Array.isArray(message) ? message : [];
    const code = status === HttpStatus.BAD_REQUEST ? 'VALIDATION_ERROR' : status === HttpStatus.UNAUTHORIZED ? 'UNAUTHORIZED' : status === HttpStatus.FORBIDDEN ? 'FORBIDDEN' : status === HttpStatus.NOT_FOUND ? 'NOT_FOUND' : status === HttpStatus.TOO_MANY_REQUESTS ? 'TOO_MANY_REQUESTS' : status === HttpStatus.SERVICE_UNAVAILABLE ? 'SERVICE_UNAVAILABLE' : 'INTERNAL_ERROR';
    response.status(status).json({ error: { code, message: Array.isArray(message) ? 'Dữ liệu không hợp lệ' : message, details }, meta: { requestId: request.requestId ?? 'unknown' } });
  }
}
