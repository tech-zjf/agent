import { Citation, ReplyAction } from '../../shared/models';

export interface DraftReplyResponse {
    action: ReplyAction;
    confidence: number;
    draftReply: string;
    clarifyQuestion?: string;
    ticketSuggestion?: {
        title: string;
        description: string;
        priority: 'low' | 'medium' | 'high';
    };
    citations: Citation[];
    memory: {
        conversationSummary: string;
        customerFacts: string[];
    };
}
