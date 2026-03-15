import { AiProvider } from './ai-provider';

export type ChatRole = 'system' | 'user' | 'assistant';

export interface StructuredObjectSchema {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
}

export interface ChatMessagePayload {
    role: ChatRole;
    content: string;
    name?: string;
}

export interface ChatGenerationRequest {
    messages: ChatMessagePayload[];
    temperature?: number;
    maxTokens?: number;
    timeoutMs?: number;
    responseSchema?: StructuredObjectSchema;
}

export interface ChatGenerationResponse {
    provider: AiProvider;
    model: string;
    text: string;
    raw?: unknown;
    usage?: {
        inputTokens?: number;
        outputTokens?: number;
        totalTokens?: number;
    };
}

export interface ImageGenerationRequest {
    prompt: string;
    size?: string;
    style?: string;
}

export interface VideoGenerationRequest {
    prompt: string;
    durationSeconds?: number;
    aspectRatio?: string;
}
