import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfiguration } from '../../config';
import { AiProviderRegistryService } from './ai-provider-registry.service';
import { ChatGenerationRequest, ChatGenerationResponse } from './types/chat.types';

@Injectable()
export class AiChatService {
    constructor(
        private readonly configService: ConfigService<AppConfiguration>,
        private readonly aiProviderRegistryService: AiProviderRegistryService,
    ) {}

    isEnabled(): boolean {
        return this.configService.getOrThrow<AppConfiguration['ai']>('ai').chat.enabled;
    }

    async generate(request: ChatGenerationRequest): Promise<ChatGenerationResponse> {
        const adapter = this.aiProviderRegistryService.getChatAdapter();
        return adapter.generate(request);
    }
}
