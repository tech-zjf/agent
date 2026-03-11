import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { type TicketPriority } from '../../shared/models';

const ticketPriorityValues = ['low', 'medium', 'high'] as const;

export class CreateTicketDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(64)
    conversationId!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(64)
    customerId!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    title!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(4000)
    description!: string;

    @IsOptional()
    @IsIn(ticketPriorityValues)
    priority?: TicketPriority;
}
