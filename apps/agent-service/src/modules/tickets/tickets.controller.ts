import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketsService } from './tickets.service';

@Controller('api/tickets')
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService) {}

    @Get()
    listTickets() {
        return {
            data: this.ticketsService.listTickets(),
        };
    }

    @Post()
    createTicket(@Body() dto: CreateTicketDto) {
        return {
            data: this.ticketsService.createTicket(dto),
        };
    }
}
