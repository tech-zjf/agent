export type CopilotAction = 'reply' | 'clarify' | 'escalate';

export interface DraftReplyPayload {
    conversationId: string;
    customerId: string;
    question: string;
    channel?: 'wechat' | 'webchat' | 'email' | 'other';
}

export interface CopilotCitation {
    articleId: string;
    title: string;
    snippet: string;
    score: number;
}

export interface DraftReplyResult {
    action: CopilotAction;
    confidence: number;
    draftReply: string;
    clarifyQuestion?: string;
    ticketSuggestion?: {
        title: string;
        description: string;
        priority: 'low' | 'medium' | 'high';
    };
    citations: CopilotCitation[];
    memory: {
        conversationSummary: string;
        customerFacts: string[];
    };
    generation: {
        aiEnabled: boolean;
        source: 'ai' | 'rule';
        provider?: string;
        model?: string;
        fallbackReason?: string;
    };
}
