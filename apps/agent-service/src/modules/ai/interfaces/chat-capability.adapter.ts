import { AiCapability, AiProvider } from '../types/ai-provider';
import { ChatGenerationRequest, ChatGenerationResponse } from '../types/chat.types';

export interface ChatCapabilityAdapter {
    readonly capability: Extract<AiCapability, 'chat'>;
    readonly provider: AiProvider;

    generate(request: ChatGenerationRequest): Promise<ChatGenerationResponse>;
}
