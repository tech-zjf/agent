import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiCode } from '../constant/api-code';
import { SKIP_RESPONSE_WRAP_KEY } from '../decorator/skip-response-wrap.decorator';

interface ApiResponseEnvelope<T> {
    code: string;
    msg: string;
    data: T;
    requestId?: string;
    path: string;
    timestamp: string;
}

@Injectable()
export class ApiResponseInterceptor<T> implements NestInterceptor<T, ApiResponseEnvelope<T>> {
    constructor(private readonly reflector: Reflector) {}

    intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponseEnvelope<T>> {
        const skipWrap = this.reflector.getAllAndOverride<boolean>(SKIP_RESPONSE_WRAP_KEY, [context.getHandler(), context.getClass()]);
        const request = context.switchToHttp().getRequest<Request>();
        const path = request?.originalUrl || request?.url || '-';
        const requestId = request?.requestId;

        return next.handle().pipe(
            map((data) => {
                if (skipWrap || this.isApiResponseEnvelope(data)) {
                    return data as ApiResponseEnvelope<T>;
                }

                return {
                    code: ApiCode.OK.code,
                    msg: ApiCode.OK.msg,
                    data: (data ?? null) as T,
                    requestId,
                    path,
                    timestamp: new Date().toISOString(),
                };
            }),
        );
    }

    private isApiResponseEnvelope(payload: unknown): payload is ApiResponseEnvelope<T> {
        if (!payload || typeof payload !== 'object') {
            return false;
        }
        const candidate = payload as Partial<ApiResponseEnvelope<T>>;
        return typeof candidate.code === 'string' && typeof candidate.msg === 'string' && 'data' in candidate;
    }
}
