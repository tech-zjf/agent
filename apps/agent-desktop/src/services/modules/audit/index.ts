import { HttpClient } from '@/lib/http';
import { AuditEventRecord } from './interface';

export class AuditService {
    constructor(private readonly client: HttpClient) {}

    list(limit = 50) {
        return this.client.get<AuditEventRecord[]>('/api/audit/events', { query: { limit } });
    }
}
