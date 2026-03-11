export interface AuditEventPayload {
    [key: string]: unknown;
}

export interface AuditEventRecord {
    id: string;
    eventType: string;
    conversationId?: string | null;
    customerId?: string | null;
    payload: AuditEventPayload;
    createdAt: string;
}
