import { TicketPriority } from '../../shared/models';

export class CreateTicketDto {
    conversationId!: string;
    customerId!: string;
    title!: string;
    description!: string;
    priority?: TicketPriority;
}
