import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIMessage, BaseMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatMinimax } from '@langchain/community/chat_models/minimax';
import { AppConfiguration } from '../../../config';
import { ChatCapabilityAdapter } from '../interfaces/chat-capability.adapter';
import { AiProvider } from '../types/ai-provider';
import { ChatGenerationRequest, ChatGenerationResponse } from '../types/chat.types';

@Injectable()
export class MinimaxChatAdapter implements ChatCapabilityAdapter {
    readonly capability = 'chat' as const;
    readonly provider: AiProvider = 'minimax';

    constructor(private readonly configService: ConfigService<AppConfiguration>) {}

    async generate(request: ChatGenerationRequest): Promise<ChatGenerationResponse> {
        const aiConfig = this.getAiConfig();
        const model = this.createModel(request);
        const response = await model.invoke(this.toLangChainMessages(request.messages), {
            signal: AbortSignal.timeout(request.timeoutMs ?? aiConfig.chat.timeoutMs),
            replyConstraints: request.responseSchema
                ? {
                      sender_type: 'BOT',
                      sender_name: 'Assistant',
                      glyph: {
                          type: 'json_value',
                          json_properties: request.responseSchema.properties,
                      },
                  }
                : undefined,
        });

        const usage = this.extractUsage(response.response_metadata);

        return {
            provider: this.provider,
            model: this.getChatModelName(),
            text: this.toText(response.content),
            raw: response.response_metadata,
            usage,
        };
    }

    private createModel(request: ChatGenerationRequest): ChatMinimax {
        const aiConfig = this.getAiConfig();

        return new ChatMinimax({
            model: this.getChatModelName(),
            minimaxApiKey: aiConfig.providers.minimax.apiKey,
            minimaxGroupId: aiConfig.providers.minimax.groupId,
            temperature: request.temperature ?? aiConfig.chat.temperature,
            tokensToGenerate: request.maxTokens ?? aiConfig.chat.maxTokens,
            configuration: {
                basePath: aiConfig.providers.minimax.baseUrl || undefined,
            },
        });
    }

    private getChatModelName(): string {
        return this.getAiConfig().chat.model;
    }

    private toLangChainMessages(messages: ChatGenerationRequest['messages']): BaseMessage[] {
        return messages.map((message) => {
            if (message.role === 'system') {
                return new SystemMessage(message.content);
            }
            if (message.role === 'assistant') {
                return new AIMessage(message.content);
            }
            return new HumanMessage(message.content);
        });
    }

    private toText(content: unknown): string {
        if (typeof content === 'string') {
            return content;
        }

        if (Array.isArray(content)) {
            return content
                .map((item) => {
                    if (typeof item === 'string') {
                        return item;
                    }

                    if (this.hasTextField(item)) {
                        return item.text;
                    }

                    return JSON.stringify(item);
                })
                .join('\n');
        }

        if (content === undefined || content === null) {
            return '';
        }

        if (typeof content === 'object') {
            return JSON.stringify(content);
        }

        if (typeof content === 'number' || typeof content === 'boolean' || typeof content === 'bigint') {
            return `${content}`;
        }

        return '';
    }

    private extractUsage(responseMetadata: unknown): ChatGenerationResponse['usage'] {
        if (!responseMetadata || typeof responseMetadata !== 'object') {
            return undefined;
        }

        const metadata = responseMetadata as {
            tokenUsage?: {
                promptTokens?: number;
                completionTokens?: number;
                totalTokens?: number;
            };
        };

        if (!metadata.tokenUsage) {
            return undefined;
        }

        return {
            inputTokens: metadata.tokenUsage.promptTokens,
            outputTokens: metadata.tokenUsage.completionTokens,
            totalTokens: metadata.tokenUsage.totalTokens,
        };
    }

    private getAiConfig(): AppConfiguration['ai'] {
        return this.configService.getOrThrow<AppConfiguration['ai']>('ai');
    }

    private hasTextField(value: unknown): value is { text: string } {
        if (!value || typeof value !== 'object' || !('text' in value)) {
            return false;
        }

        const candidate = value as { text?: unknown };
        return typeof candidate.text === 'string';
    }
}
