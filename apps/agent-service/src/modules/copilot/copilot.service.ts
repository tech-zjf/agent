import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfiguration } from '../../config';
import { AuditService } from '../audit/audit.service';
import { KnowledgeService } from '../knowledge/knowledge.service';
import { MemoryService } from '../memory/memory.service';
import { Citation, ReplyAction } from '../shared/models';
import { DraftReplyDto } from './dto/draft-reply.dto';
import { CopilotAgentService } from './copilot-agent.service';
import { DraftReplyResponse } from './types/draft-reply.response';

interface DraftReplyGenerationState {
    aiEnabled: boolean;
    source: 'ai' | 'rule';
    provider?: string;
    model?: string;
    fallbackReason?: string;
    decision: {
        action: ReplyAction;
        confidence: number;
        draftReply: string;
        clarifyQuestion?: string;
        ticketSuggestion?: {
            title: string;
            description: string;
            priority: 'low' | 'medium' | 'high';
        };
        extractedCustomerFacts: string[];
    };
}

@Injectable()
export class CopilotService {
    private readonly logger = new Logger(CopilotService.name);
    private readonly confidenceThreshold = 0.65;
    private readonly allowedChannels = new Set(['wechat', 'webchat', 'email', 'other']);

    constructor(
        private readonly configService: ConfigService<AppConfiguration>,
        private readonly knowledgeService: KnowledgeService,
        private readonly memoryService: MemoryService,
        private readonly auditService: AuditService,
        private readonly copilotAgentService: CopilotAgentService,
    ) {}

    async draftReply(input: DraftReplyDto): Promise<DraftReplyResponse> {
        const normalizedInput = this.normalizeDraftInput(input);
        const aiEnabled = this.copilotAgentService.isEnabled();
        const customerMemory = await this.memoryService.getCustomerMemory(normalizedInput.customerId);
        const conversationMemory = await this.memoryService.getConversationMemory(normalizedInput.conversationId, normalizedInput.customerId);

        const topK = this.configService.getOrThrow<AppConfiguration['retrieval']>('retrieval').topK;
        const articles = (await this.knowledgeService.searchArticles(normalizedInput.question)).slice(0, topK);

        const citations = this.buildCitations(
            articles.map((article) => article.content),
            articles.map((article) => article.id),
            articles.map((article) => article.title),
        );

        this.logger.log(`draftReply start conversationId=${normalizedInput.conversationId} aiEnabled=${aiEnabled} citations=${citations.length} topK=${topK}`);

        const generation: DraftReplyGenerationState = aiEnabled
            ? await this.generateAiDecision({
                  normalizedInput,
                  citations,
                  customerFacts: customerMemory.facts,
                  conversationSummary: conversationMemory.summary,
                  recentQuestions: conversationMemory.recentQuestions,
              })
            : {
                  source: 'rule' as const,
                  aiEnabled,
                  decision: this.generateDeterministicDecision(normalizedInput.question, citations, customerMemory.facts),
              };

        const decision = generation.decision;

        const updatedCustomerMemory = decision.extractedCustomerFacts.length
            ? await this.memoryService.addCustomerFacts(normalizedInput.customerId, decision.extractedCustomerFacts)
            : customerMemory;

        const answerSummary = `${decision.action} | confidence=${decision.confidence.toFixed(2)} | question=${normalizedInput.question.slice(0, 80)}`;
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
                action: decision.action,
                confidence: decision.confidence,
                aiEnabled,
                generation,
                citations: citations.map((citation) => ({
                    articleId: citation.articleId,
                    score: citation.score,
                })),
            },
            normalizedInput.conversationId,
            normalizedInput.customerId,
        );

        return {
            action: decision.action,
            confidence: decision.confidence,
            draftReply: decision.draftReply,
            clarifyQuestion: decision.clarifyQuestion,
            ticketSuggestion: decision.ticketSuggestion,
            citations,
            memory: {
                conversationSummary: updatedConversation.summary,
                customerFacts: updatedCustomerMemory.facts,
            },
            generation: {
                aiEnabled: generation.aiEnabled,
                source: generation.source,
                provider: generation.provider,
                model: generation.model,
                fallbackReason: generation.fallbackReason,
            },
        };
    }

    private async generateAiDecision(input: {
        normalizedInput: {
            conversationId: string;
            customerId: string;
            question: string;
            channel: 'wechat' | 'webchat' | 'email' | 'other';
        };
        citations: Citation[];
        customerFacts: string[];
        conversationSummary: string;
        recentQuestions: string[];
    }): Promise<DraftReplyGenerationState> {
        try {
            const aiGeneration = await this.copilotAgentService.generateDecision({
                question: input.normalizedInput.question,
                channel: input.normalizedInput.channel,
                citations: input.citations,
                customerFacts: input.customerFacts,
                conversationSummary: input.conversationSummary,
                recentQuestions: input.recentQuestions,
            });

            const guardedDecision = this.applyDecisionGuardrails(aiGeneration.decision, input.normalizedInput.question, input.citations, input.customerFacts);

            this.logger.log(
                `draftReply ai-used provider=${aiGeneration.provider} model=${aiGeneration.model} action=${guardedDecision.action} confidence=${guardedDecision.confidence.toFixed(2)}`,
            );

            return {
                aiEnabled: true,
                source: 'ai' as const,
                provider: aiGeneration.provider,
                model: aiGeneration.model,
                decision: guardedDecision,
            };
        } catch (error) {
            const fallbackReason = error instanceof Error ? error.message : String(error);
            this.logger.warn(`AI draft failed, fallback to deterministic strategy: ${fallbackReason}`);

            return {
                aiEnabled: true,
                source: 'rule' as const,
                fallbackReason,
                decision: this.generateDeterministicDecision(input.normalizedInput.question, input.citations, input.customerFacts),
            };
        }
    }

    private generateDeterministicDecision(question: string, citations: Citation[], customerFacts: string[]) {
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

        if (action === 'clarify') {
            clarifyQuestion = this.getDefaultClarifyQuestion();
        }

        if (action === 'escalate') {
            ticketSuggestion = this.buildEscalationTicket(question);
        }

        return {
            action,
            confidence,
            draftReply: this.composeDraftReply(question, citations, customerFacts, action),
            clarifyQuestion,
            ticketSuggestion,
            extractedCustomerFacts: [],
        };
    }

    private applyDecisionGuardrails(
        decision: {
            action: ReplyAction;
            confidence: number;
            draftReply: string;
            clarifyQuestion?: string;
            ticketSuggestion?: {
                title: string;
                description: string;
                priority: 'low' | 'medium' | 'high';
            };
            extractedCustomerFacts: string[];
        },
        question: string,
        citations: Citation[],
        existingFacts: string[],
    ) {
        const confidence = Number(Math.min(Math.max(decision.confidence, 0), 1).toFixed(2));
        let action = decision.action;

        if (citations.length === 0 && action === 'reply') {
            action = confidence >= this.confidenceThreshold ? 'clarify' : 'escalate';
        }

        const dedupedFacts = decision.extractedCustomerFacts
            .map((fact) => fact.trim())
            .filter((fact) => fact.length > 0)
            .filter((fact) => !existingFacts.includes(fact))
            .slice(0, 3);

        return {
            action,
            confidence,
            draftReply: decision.draftReply.trim() || this.composeDraftReply(question, citations, existingFacts, action),
            clarifyQuestion: action === 'clarify' ? decision.clarifyQuestion?.trim() || this.getDefaultClarifyQuestion() : undefined,
            ticketSuggestion: action === 'escalate' ? decision.ticketSuggestion || this.buildEscalationTicket(question) : undefined,
            extractedCustomerFacts: dedupedFacts,
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

        const clarifyHint = action === 'clarify' ? `\n为保证准确性，建议先补充：${this.getDefaultClarifyQuestion()}` : '';

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

    private getDefaultClarifyQuestion(): string {
        return '为了给你准确答复，我需要确认一下：你遇到的是具体哪一个订单号，以及问题发生的时间点？';
    }

    private buildEscalationTicket(question: string): {
        title: string;
        description: string;
        priority: 'low' | 'medium' | 'high';
    } {
        return {
            title: `待人工介入: ${question.slice(0, 24)}`,
            description: `系统未能从知识库匹配到可靠答案，建议二线支持介入。原问题：${question}`,
            priority: 'medium',
        };
    }
}
