import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditEventEntity, ConversationEntity, CustomerMemoryFactEntity, KnowledgeArticleEntity, TicketEntity } from '../../database/entities';
import { DataStoreService } from './data-store.service';

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([KnowledgeArticleEntity, CustomerMemoryFactEntity, ConversationEntity, TicketEntity, AuditEventEntity])],
    providers: [DataStoreService],
    exports: [DataStoreService],
})
export class DataStoreModule {}
