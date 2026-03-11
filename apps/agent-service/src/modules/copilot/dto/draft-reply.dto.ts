export class DraftReplyDto {
    conversationId!: string;
    customerId!: string;
    question!: string;
    channel?: 'wechat' | 'webchat' | 'email' | 'other';
}
