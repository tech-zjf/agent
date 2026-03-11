import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketsService } from './tickets.service';

@Controller('api/tickets')
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService) {}

    @Get()
    async listTickets() {
        return this.ticketsService.listTickets();
    }

    @Post()
    async createTicket(@Body() dto: CreateTicketDto) {
        return this.ticketsService.createTicket(dto);
    }
}
