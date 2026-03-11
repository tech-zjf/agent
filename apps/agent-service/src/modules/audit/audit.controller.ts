import { Controller, Get, Query } from '@nestjs/common';
import { AuditService } from './audit.service';

@Controller('api/audit/events')
export class AuditController {
    constructor(private readonly auditService: AuditService) {}

    @Get()
    async listEvents(@Query('limit') limit = '50') {
        const parsedLimit = Number.parseInt(limit, 10);
        const safeLimit = Number.isNaN(parsedLimit) ? 50 : parsedLimit;

        return {
            data: await this.auditService.listEvents(safeLimit),
        };
    }
}
