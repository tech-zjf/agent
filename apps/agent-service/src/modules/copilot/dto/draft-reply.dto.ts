import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

const channelValues = ['wechat', 'webchat', 'email', 'other'] as const;

export class DraftReplyDto {
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
    @MaxLength(1000)
    question!: string;

    @IsOptional()
    @IsIn(channelValues)
    channel?: 'wechat' | 'webchat' | 'email' | 'other';
}
