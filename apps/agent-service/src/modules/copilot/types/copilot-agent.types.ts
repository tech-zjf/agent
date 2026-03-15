import { Citation, ReplyAction, TicketPriority } from '../../shared/models';

export interface CopilotAgentContext {
    question: string;
    channel: 'wechat' | 'webchat' | 'email' | 'other';
    citations: Citation[];
    customerFacts: string[];
    conversationSummary: string;
    recentQuestions: string[];
}

export interface CopilotAgentDecision {
    action: ReplyAction;
    confidence: number;
    draftReply: string;
    clarifyQuestion?: string;
    ticketSuggestion?: {
        title: string;
        description: string;
        priority: TicketPriority;
    };
    extractedCustomerFacts: string[];
}

export interface CopilotAgentGeneration {
    provider: string;
    model: string;
    decision: CopilotAgentDecision;
}
