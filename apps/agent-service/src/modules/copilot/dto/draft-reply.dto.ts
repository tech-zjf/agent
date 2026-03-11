export class DraftReplyDto {
    conversationId!: string;
    customerId!: string;
    customerQuestion!: string;
    channel?: 'wechat' | 'webchat' | 'email' | 'other';
}
