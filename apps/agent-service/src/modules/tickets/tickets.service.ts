import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AuditService } from '../audit/audit.service';
import { DataStoreService } from '../data-store/data-store.service';
import { SupportTicket, TicketPriority } from '../shared/models';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Injectable()
export class TicketsService {
    constructor(
        private readonly dataStore: DataStoreService,
        private readonly auditService: AuditService,
    ) {}

    async createTicket(dto: CreateTicketDto): Promise<SupportTicket> {
        const priority: TicketPriority = dto.priority ?? 'medium';

        const ticket: SupportTicket = {
            id: randomUUID(),
            conversationId: dto.conversationId,
            customerId: dto.customerId,
            title: dto.title.trim(),
            description: dto.description.trim(),
            priority,
            status: 'open',
            createdAt: new Date().toISOString(),
        };

        const created = await this.dataStore.addTicket(ticket);
        await this.auditService.recordEvent(
            'ticket.created',
            {
                ticketId: created.id,
                title: created.title,
                priority: created.priority,
            },
            created.conversationId,
            created.customerId,
        );

        return created;
    }

    async listTickets(): Promise<SupportTicket[]> {
        return this.dataStore.listTickets();
    }
}
