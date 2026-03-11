import { Injectable } from '@nestjs/common';
import { AuditEvent, ConversationMemory, CustomerMemory, KnowledgeArticle, SupportTicket } from '../shared/models';

@Injectable()
export class DataStoreService {
    private readonly knowledgeArticles: KnowledgeArticle[] = [];
    private readonly customerMemory = new Map<string, CustomerMemory>();
    private readonly conversationMemory = new Map<string, ConversationMemory>();
    private readonly tickets: SupportTicket[] = [];
    private readonly auditEvents: AuditEvent[] = [];

    listArticles(): KnowledgeArticle[] {
        return [...this.knowledgeArticles].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }

    addArticle(article: KnowledgeArticle): KnowledgeArticle {
        this.knowledgeArticles.push(article);
        return article;
    }

    searchArticles(query: string): KnowledgeArticle[] {
        const normalized = query.trim().toLowerCase();
        if (!normalized) {
            return [];
        }

        return this.knowledgeArticles
            .map((article) => {
                const haystack = `${article.title} ${article.content} ${article.tags.join(' ')}`.toLowerCase();
                const score = normalized.split(/\s+/).reduce((sum, token) => sum + (haystack.includes(token) ? 1 : 0), 0);

                return { article, score };
            })
            .filter((item) => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .map((item) => item.article);
    }

    getCustomerMemory(customerId: string): CustomerMemory {
        const existing = this.customerMemory.get(customerId);
        if (existing) {
            return existing;
        }

        const memory: CustomerMemory = {
            customerId,
            facts: [],
            updatedAt: new Date().toISOString(),
        };
        this.customerMemory.set(customerId, memory);
        return memory;
    }

    upsertCustomerFacts(customerId: string, facts: string[]): CustomerMemory {
        const existing = this.getCustomerMemory(customerId);
        const merged = [...new Set([...existing.facts, ...facts])];
        const updated: CustomerMemory = {
            ...existing,
            facts: merged,
            updatedAt: new Date().toISOString(),
        };

        this.customerMemory.set(customerId, updated);
        return updated;
    }

    getConversationMemory(conversationId: string, customerId: string): ConversationMemory {
        const existing = this.conversationMemory.get(conversationId);
        if (existing) {
            return existing;
        }

        const memory: ConversationMemory = {
            conversationId,
            customerId,
            summary: '',
            recentQuestions: [],
            updatedAt: new Date().toISOString(),
        };

        this.conversationMemory.set(conversationId, memory);
        return memory;
    }

    updateConversationMemory(conversationId: string, customerId: string, question: string, answerSummary: string): ConversationMemory {
        const existing = this.getConversationMemory(conversationId, customerId);
        const trimmedQuestions = [...existing.recentQuestions, question].slice(-8);
        const summary = `${existing.summary} ${answerSummary}`.trim().slice(0, 600);

        const updated: ConversationMemory = {
            ...existing,
            summary,
            recentQuestions: trimmedQuestions,
            updatedAt: new Date().toISOString(),
        };

        this.conversationMemory.set(conversationId, updated);
        return updated;
    }

    listTickets(): SupportTicket[] {
        return [...this.tickets].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }

    addTicket(ticket: SupportTicket): SupportTicket {
        this.tickets.push(ticket);
        return ticket;
    }

    addAuditEvent(event: AuditEvent): AuditEvent {
        this.auditEvents.push(event);
        return event;
    }

    listAuditEvents(limit: number): AuditEvent[] {
        return [...this.auditEvents].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, Math.max(1, Math.min(limit, 200)));
    }
}
