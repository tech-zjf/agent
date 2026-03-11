import { Injectable } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { Citation, ReplyAction } from '../shared/models';
import { KnowledgeService } from '../knowledge/knowledge.service';
import { MemoryService } from '../memory/memory.service';
import { DraftReplyDto } from './dto/draft-reply.dto';
import { DraftReplyResponse } from './types/draft-reply.response';

@Injectable()
export class CopilotService {
    private readonly confidenceThreshold = 0.65;

    constructor(
        private readonly knowledgeService: KnowledgeService,
        private readonly memoryService: MemoryService,
        private readonly auditService: AuditService,
    ) {}

    draftReply(input: DraftReplyDto): DraftReplyResponse {
        const question = input.customerQuestion.trim();
        const customerMemory = this.memoryService.getCustomerMemory(input.customerId);
        this.memoryService.getConversationMemory(input.conversationId, input.customerId);

        const articles = this.knowledgeService.searchArticles(question).slice(0, 3);
        const citations = this.buildCitations(
            articles.map((article) => article.content),
            articles.map((article) => article.id),
            articles.map((article) => article.title),
        );
        const confidence = this.calculateConfidence(question, citations);

        let action: ReplyAction = 'reply';
        let clarifyQuestion: string | undefined;
        let ticketSuggestion:
            | {
                  title: string;
                  description: string;
                  priority: 'low' | 'medium' | 'high';
              }
            | undefined;

        if (confidence < this.confidenceThreshold) {
            action = citations.length === 0 ? 'escalate' : 'clarify';
        }

        const draftReply = this.composeDraftReply(question, citations, customerMemory.facts, action);

        if (action === 'clarify') {
            clarifyQuestion = '为了给你准确答复，我需要确认一下：你遇到的是具体哪一个订单号，以及问题发生的时间点？';
        }

        if (action === 'escalate') {
            ticketSuggestion = {
                title: `待人工介入: ${question.slice(0, 24)}`,
                description: `系统未能从知识库匹配到可靠答案，建议二线支持介入。原问题：${question}`,
                priority: 'medium',
            };
        }

        const answerSummary = `${action} | confidence=${confidence.toFixed(2)} | question=${question.slice(0, 80)}`;
        const updatedConversation = this.memoryService.updateConversationMemory(input.conversationId, input.customerId, question, answerSummary);

        this.auditService.recordEvent(
            'copilot.draft_generated',
            {
                action,
                confidence,
                citations: citations.map((citation) => ({
                    articleId: citation.articleId,
                    score: citation.score,
                })),
            },
            input.conversationId,
            input.customerId,
        );

        return {
            action,
            confidence,
            draftReply,
            clarifyQuestion,
            ticketSuggestion,
            citations,
            memory: {
                conversationSummary: updatedConversation.summary,
                customerFacts: customerMemory.facts,
            },
        };
    }

    private calculateConfidence(question: string, citations: Citation[]): number {
        if (citations.length === 0) {
            return 0.2;
        }

        const questionTokens = question.toLowerCase().split(/\s+/).filter(Boolean).length;
        const base = Math.min(0.55 + citations.length * 0.1, 0.85);
        const diversity = questionTokens > 10 ? 0.06 : 0.02;

        return Number(Math.min(base + diversity, 0.92).toFixed(2));
    }

    private composeDraftReply(question: string, citations: Citation[], customerFacts: string[], action: ReplyAction): string {
        if (action === 'escalate') {
            return '当前问题未命中可用知识条目，我建议先向客户说明已升级处理，并承诺回访时间。';
        }

        const header = '已收到你的问题，我先基于当前规则给出处理建议：';
        const citationSummary = citations.map((citation, index) => `${index + 1}. ${citation.title}: ${citation.snippet}`).join('\n');

        const personalization = customerFacts.length > 0 ? `\n结合历史信息（${customerFacts.slice(0, 2).join('；')}），建议优先核对客户身份与订单状态。` : '';

        const clarifyHint = action === 'clarify' ? '\n为保证准确性，建议先补充订单号与具体发生时间。' : '';

        return `${header}\n问题摘要: ${question}\n${citationSummary}${personalization}${clarifyHint}`;
    }

    private buildCitations(contents: string[], articleIds: string[], titles: string[]): Citation[] {
        return contents.map((content, index) => {
            const snippet = `${content.slice(0, 78)}${content.length > 78 ? '...' : ''}`;
            const score = Number((0.85 - index * 0.1).toFixed(2));

            return {
                articleId: articleIds[index],
                title: titles[index],
                snippet,
                score,
            };
        });
    }
}
