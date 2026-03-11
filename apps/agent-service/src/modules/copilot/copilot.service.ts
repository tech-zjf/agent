import { BadRequestException, Injectable } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { KnowledgeService } from '../knowledge/knowledge.service';
import { MemoryService } from '../memory/memory.service';
import { Citation, ReplyAction } from '../shared/models';
import { DraftReplyDto } from './dto/draft-reply.dto';
import { DraftReplyResponse } from './types/draft-reply.response';

@Injectable()
export class CopilotService {
    private readonly confidenceThreshold = 0.65;
    private readonly allowedChannels = new Set(['wechat', 'webchat', 'email', 'other']);

    constructor(
        private readonly knowledgeService: KnowledgeService,
        private readonly memoryService: MemoryService,
        private readonly auditService: AuditService,
    ) {}

    async draftReply(input: DraftReplyDto): Promise<DraftReplyResponse> {
        const normalizedInput = this.normalizeDraftInput(input);
        const customerMemory = await this.memoryService.getCustomerMemory(normalizedInput.customerId);
        await this.memoryService.getConversationMemory(normalizedInput.conversationId, normalizedInput.customerId);

        const topK = 3;
        const articles = (await this.knowledgeService.searchArticles(normalizedInput.question)).slice(0, topK);

        const citations = this.buildCitations(
            articles.map((article) => article.content),
            articles.map((article) => article.id),
            articles.map((article) => article.title),
        );

        const confidence = this.calculateConfidence(normalizedInput.question, citations);

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

        const draftReply = this.composeDraftReply(normalizedInput.question, citations, customerMemory.facts, action);

        if (action === 'clarify') {
            clarifyQuestion = '为了给你准确答复，我需要确认一下：你遇到的是具体哪一个订单号，以及问题发生的时间点？';
        }

        if (action === 'escalate') {
            ticketSuggestion = {
                title: `待人工介入: ${normalizedInput.question.slice(0, 24)}`,
                description: `系统未能从知识库匹配到可靠答案，建议二线支持介入。原问题：${normalizedInput.question}`,
                priority: 'medium',
            };
        }

        const answerSummary = `${action} | confidence=${confidence.toFixed(2)} | question=${normalizedInput.question.slice(0, 80)}`;
        const updatedConversation = await this.memoryService.updateConversationMemory(
            normalizedInput.conversationId,
            normalizedInput.customerId,
            normalizedInput.question,
            answerSummary,
            normalizedInput.channel,
        );

        await this.auditService.recordEvent(
            'copilot.draft_generated',
            {
                action,
                confidence,
                citations: citations.map((citation) => ({
                    articleId: citation.articleId,
                    score: citation.score,
                })),
            },
            normalizedInput.conversationId,
            normalizedInput.customerId,
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

    private normalizeDraftInput(input: DraftReplyDto): {
        conversationId: string;
        customerId: string;
        question: string;
        channel: 'wechat' | 'webchat' | 'email' | 'other';
    } {
        const conversationId = (input.conversationId || '').trim();
        const customerId = (input.customerId || '').trim();
        const question = (input.question || '').trim();
        const rawChannel = input.channel ?? 'other';
        const channel = this.allowedChannels.has(rawChannel) ? rawChannel : 'other';

        if (!conversationId) {
            throw new BadRequestException('conversationId 不能为空');
        }
        if (!customerId) {
            throw new BadRequestException('customerId 不能为空');
        }
        if (!question) {
            throw new BadRequestException('question 不能为空');
        }

        return {
            conversationId,
            customerId,
            question,
            channel,
        };
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
