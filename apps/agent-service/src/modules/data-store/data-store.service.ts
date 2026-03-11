import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { Repository } from 'typeorm';
import { AuditEventEntity, ConversationEntity, CustomerMemoryFactEntity, KnowledgeArticleEntity, TicketEntity } from '../../database/entities';
import { AuditEvent, ConversationMemory, CustomerMemory, KnowledgeArticle, SupportTicket } from '../shared/models';

@Injectable()
export class DataStoreService {
    constructor(
        @InjectRepository(KnowledgeArticleEntity)
        private readonly knowledgeArticleRepository: Repository<KnowledgeArticleEntity>,
        @InjectRepository(CustomerMemoryFactEntity)
        private readonly customerMemoryFactRepository: Repository<CustomerMemoryFactEntity>,
        @InjectRepository(ConversationEntity)
        private readonly conversationRepository: Repository<ConversationEntity>,
        @InjectRepository(TicketEntity)
        private readonly ticketRepository: Repository<TicketEntity>,
        @InjectRepository(AuditEventEntity)
        private readonly auditEventRepository: Repository<AuditEventEntity>,
    ) {}

    async listArticles(): Promise<KnowledgeArticle[]> {
        const rows = await this.knowledgeArticleRepository.find({
            order: { createdAt: 'DESC' },
        });

        return rows.map((row) => ({
            id: row.id,
            title: row.title,
            content: row.content,
            tags: row.tags,
            createdAt: row.createdAt.toISOString(),
        }));
    }

    async addArticle(article: KnowledgeArticle): Promise<KnowledgeArticle> {
        const entity = this.knowledgeArticleRepository.create({
            id: article.id,
            title: article.title,
            content: article.content,
            tags: article.tags,
            status: 'active',
        });

        const saved = await this.knowledgeArticleRepository.save(entity);
        return {
            id: saved.id,
            title: saved.title,
            content: saved.content,
            tags: saved.tags,
            createdAt: saved.createdAt.toISOString(),
        };
    }

    async searchArticles(query: string): Promise<KnowledgeArticle[]> {
        const normalized = query.trim().toLowerCase();
        if (!normalized) {
            return [];
        }

        const tokens = normalized.split(/\s+/).filter(Boolean);
        const qb = this.knowledgeArticleRepository.createQueryBuilder('article').orderBy('article.updated_at', 'DESC').limit(100);

        tokens.forEach((token, index) => {
            qb.orWhere(`article.title ILIKE :token${index}`, {
                [`token${index}`]: `%${token}%`,
            })
                .orWhere(`article.content ILIKE :contentToken${index}`, {
                    [`contentToken${index}`]: `%${token}%`,
                })
                .orWhere(`array_to_string(article.tags, ' ') ILIKE :tagToken${index}`, {
                    [`tagToken${index}`]: `%${token}%`,
                });
        });

        const candidates = await qb.getMany();
        const scored = candidates
            .map((row) => {
                const haystack = `${row.title} ${row.content} ${row.tags.join(' ')}`.toLowerCase();
                const score = tokens.reduce((sum, token) => sum + (haystack.includes(token) ? 1 : 0), 0);
                return { row, score };
            })
            .filter((item) => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 20)
            .map((item) => item.row);

        return scored.map((row) => ({
            id: row.id,
            title: row.title,
            content: row.content,
            tags: row.tags,
            createdAt: row.createdAt.toISOString(),
        }));
    }

    async getCustomerMemory(customerId: string): Promise<CustomerMemory> {
        const rows = await this.customerMemoryFactRepository.find({
            where: { customerId },
            order: { createdAt: 'DESC' },
            take: 50,
        });

        return {
            customerId,
            facts: [...new Set(rows.map((row) => row.fact))],
            updatedAt: rows.length > 0 ? rows[0].createdAt.toISOString() : new Date().toISOString(),
        };
    }

    async upsertCustomerFacts(customerId: string, facts: string[]): Promise<CustomerMemory> {
        const existing = await this.customerMemoryFactRepository.find({
            where: { customerId },
            select: ['fact'],
        });

        const existingSet = new Set(existing.map((item) => item.fact));
        const newFacts = facts.filter((fact) => !existingSet.has(fact));

        if (newFacts.length > 0) {
            const entities = newFacts.map((fact) =>
                this.customerMemoryFactRepository.create({
                    id: randomUUID(),
                    customerId,
                    fact,
                }),
            );
            await this.customerMemoryFactRepository.save(entities);
        }

        return this.getCustomerMemory(customerId);
    }

    async getConversationMemory(conversationId: string, customerId: string): Promise<ConversationMemory> {
        let row = await this.conversationRepository.findOne({
            where: { id: conversationId },
        });

        if (!row) {
            row = await this.conversationRepository.save(
                this.conversationRepository.create({
                    id: conversationId,
                    customerId,
                    channel: 'other',
                    latestSummary: '',
                    recentQuestions: [],
                }),
            );
        }

        return {
            conversationId: row.id,
            customerId: row.customerId,
            summary: row.latestSummary,
            recentQuestions: row.recentQuestions ?? [],
            updatedAt: row.updatedAt.toISOString(),
        };
    }

    async updateConversationMemory(
        conversationId: string,
        customerId: string,
        question: string,
        answerSummary: string,
        channel?: string,
    ): Promise<ConversationMemory> {
        const existing = await this.getConversationMemory(conversationId, customerId);
        const nextQuestions = [...existing.recentQuestions, question].slice(-8);
        const nextSummary = `${existing.summary} ${answerSummary}`.trim().slice(0, 600);

        const row = await this.conversationRepository.save(
            this.conversationRepository.create({
                id: conversationId,
                customerId,
                channel: channel ?? 'other',
                latestSummary: nextSummary,
                recentQuestions: nextQuestions,
            }),
        );

        return {
            conversationId: row.id,
            customerId: row.customerId,
            summary: row.latestSummary,
            recentQuestions: row.recentQuestions ?? [],
            updatedAt: row.updatedAt.toISOString(),
        };
    }

    async listTickets(): Promise<SupportTicket[]> {
        const rows = await this.ticketRepository.find({
            order: { createdAt: 'DESC' },
            take: 200,
        });

        return rows.map((row) => ({
            id: row.id,
            conversationId: row.conversationId,
            customerId: row.customerId,
            title: row.title,
            description: row.description,
            priority: row.priority,
            status: row.status,
            createdAt: row.createdAt.toISOString(),
        }));
    }

    async addTicket(ticket: SupportTicket): Promise<SupportTicket> {
        const row = await this.ticketRepository.save(
            this.ticketRepository.create({
                id: ticket.id,
                conversationId: ticket.conversationId,
                customerId: ticket.customerId,
                title: ticket.title,
                description: ticket.description,
                priority: ticket.priority,
                status: ticket.status,
            }),
        );

        return {
            id: row.id,
            conversationId: row.conversationId,
            customerId: row.customerId,
            title: row.title,
            description: row.description,
            priority: row.priority,
            status: row.status,
            createdAt: row.createdAt.toISOString(),
        };
    }

    async addAuditEvent(event: AuditEvent): Promise<AuditEvent> {
        const row = await this.auditEventRepository.save(
            this.auditEventRepository.create({
                id: event.id,
                eventType: event.eventType,
                conversationId: event.conversationId,
                customerId: event.customerId,
                payload: event.payload,
            }),
        );

        return {
            id: row.id,
            eventType: row.eventType,
            conversationId: row.conversationId ?? undefined,
            customerId: row.customerId ?? undefined,
            payload: row.payload,
            createdAt: row.createdAt.toISOString(),
        };
    }

    async listAuditEvents(limit: number): Promise<AuditEvent[]> {
        const safeLimit = Math.max(1, Math.min(limit, 200));
        const rows = await this.auditEventRepository.find({
            order: { createdAt: 'DESC' },
            take: safeLimit,
        });

        return rows.map((row) => ({
            id: row.id,
            eventType: row.eventType,
            conversationId: row.conversationId ?? undefined,
            customerId: row.customerId ?? undefined,
            payload: row.payload,
            createdAt: row.createdAt.toISOString(),
        }));
    }
}
