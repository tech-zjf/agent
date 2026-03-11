import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
    private readonly logger = new Logger(RequestContextMiddleware.name);

    use(req: Request, res: Response, next: NextFunction): void {
        const requestId = req.headers['x-request-id']?.toString() || randomUUID();
        req.requestId = requestId;
        req.startedAt = Date.now();

        res.setHeader('x-request-id', requestId);
        res.on('finish', () => {
            const durationMs = Date.now() - (req.startedAt || Date.now());
            this.logger.log(`[${requestId}] ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`);
        });

        next();
    }
}
