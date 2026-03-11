export type ReplyAction = 'reply' | 'clarify' | 'escalate';
export type TicketPriority = 'low' | 'medium' | 'high';

export interface KnowledgeArticle {
    id: string;
    title: string;
    content: string;
    tags: string[];
    createdAt: string;
}

export interface Citation {
    articleId: string;
    title: string;
    snippet: string;
    score: number;
}

export interface CustomerMemory {
    customerId: string;
    facts: string[];
    updatedAt: string;
}

export interface ConversationMemory {
    conversationId: string;
    customerId: string;
    summary: string;
    recentQuestions: string[];
    updatedAt: string;
}

export interface SupportTicket {
    id: string;
    conversationId: string;
    customerId: string;
    title: string;
    description: string;
    priority: TicketPriority;
    status: 'open' | 'closed';
    createdAt: string;
}

export interface AuditEvent {
    id: string;
    eventType: string;
    conversationId?: string;
    customerId?: string;
    payload: Record<string, unknown>;
    createdAt: string;
}
