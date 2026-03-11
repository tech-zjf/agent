import { HttpClient } from '@/lib/http';
import { CreateTicketPayload, TicketRecord } from './interface';

export class TicketsService {
    constructor(private readonly client: HttpClient) {}

    list() {
        return this.client.get<TicketRecord[]>('/api/tickets');
    }

    create(payload: CreateTicketPayload) {
        return this.client.post<TicketRecord>('/api/tickets', { body: payload });
    }
}
