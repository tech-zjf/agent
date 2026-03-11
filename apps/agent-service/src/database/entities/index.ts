import { AuditEventEntity } from './audit-event.entity';
import { ConversationEntity } from './conversation.entity';
import { CustomerMemoryFactEntity } from './customer-memory-fact.entity';
import { KnowledgeArticleEntity } from './knowledge-article.entity';
import { KnowledgeChunkEntity } from './knowledge-chunk.entity';
import { TicketEntity } from './ticket.entity';

export const DATABASE_ENTITIES = [
    KnowledgeArticleEntity,
    KnowledgeChunkEntity,
    CustomerMemoryFactEntity,
    ConversationEntity,
    TicketEntity,
    AuditEventEntity,
] as const;

export { AuditEventEntity, ConversationEntity, CustomerMemoryFactEntity, KnowledgeArticleEntity, KnowledgeChunkEntity, TicketEntity };
