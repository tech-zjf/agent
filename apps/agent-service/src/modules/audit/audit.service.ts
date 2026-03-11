import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DataStoreService } from '../data-store/data-store.service';
import { AuditEvent } from '../shared/models';

@Injectable()
export class AuditService {
    constructor(private readonly dataStore: DataStoreService) {}

    async recordEvent(eventType: string, payload: Record<string, unknown>, conversationId?: string, customerId?: string): Promise<AuditEvent> {
        const event: AuditEvent = {
            id: randomUUID(),
            eventType,
            payload,
            conversationId,
            customerId,
            createdAt: new Date().toISOString(),
        };

        return this.dataStore.addAuditEvent(event);
    }

    async listEvents(limit: number): Promise<AuditEvent[]> {
        return this.dataStore.listAuditEvents(limit);
    }
}
