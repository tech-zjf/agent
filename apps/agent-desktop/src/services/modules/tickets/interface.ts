export type TicketPriority = 'low' | 'medium' | 'high';
export type TicketStatus = 'open' | 'closed';

export interface TicketRecord {
    id: string;
    conversationId: string;
    customerId: string;
    title: string;
    description: string;
    priority: TicketPriority;
    status: TicketStatus;
    createdAt: string;
}

export interface CreateTicketPayload {
    conversationId: string;
    customerId: string;
    title: string;
    description: string;
    priority?: TicketPriority;
}
