import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger, NotFoundException } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiCode } from '../constant/api-code';
import { ApiException } from './api.exception';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const requestId = request?.requestId;
        const path = request?.originalUrl || request?.url || '-';
        const method = request?.method || '-';
        const timestamp = new Date().toISOString();

        let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
        let code: string = ApiCode.SYSTEM_ERROR.code;
        let msg: string = ApiCode.SYSTEM_ERROR.msg;

        if (exception instanceof ApiException) {
            statusCode = exception.getStatus();
            code = exception.getErrorCode();
            msg = exception.getErrorMessage();
        } else if (exception instanceof NotFoundException) {
            statusCode = exception.getStatus();
            code = ApiCode.ROUTER_NOT_FOUND.code;
            msg = ApiCode.ROUTER_NOT_FOUND.msg;
        } else if (exception instanceof HttpException) {
            statusCode = exception.getStatus();
            msg = this.extractHttpExceptionMessage(exception.getResponse());

            code = statusCode >= 500 ? ApiCode.SYSTEM_ERROR.code : ApiCode.VALIDATE_PARAMS_ERROR.code;
        } else if (exception instanceof Error) {
            msg = exception.message || ApiCode.SYSTEM_ERROR.msg;
        }

        const stack = exception instanceof Error ? exception.stack : String(exception);
        this.logger.error(`[${requestId || '-'}] ${method} ${path} -> ${statusCode} ${code} ${msg}`, stack);

        response.status(statusCode).json({
            code,
            msg,
            data: null,
            requestId,
            path,
            timestamp,
        });
    }

    private extractHttpExceptionMessage(payload: unknown): string {
        if (typeof payload === 'string') {
            return payload;
        }

        if (payload && typeof payload === 'object') {
            const maybeMessage = (payload as { message?: string | string[] }).message;
            if (Array.isArray(maybeMessage)) {
                return maybeMessage[0] || ApiCode.VALIDATE_PARAMS_ERROR.msg;
            }
            if (typeof maybeMessage === 'string') {
                return maybeMessage;
            }
        }

        return ApiCode.VALIDATE_PARAMS_ERROR.msg;
    }
}
