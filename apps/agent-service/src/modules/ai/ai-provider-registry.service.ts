import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfiguration } from '../../config';
import { ChatCapabilityAdapter } from './interfaces/chat-capability.adapter';
import { MinimaxChatAdapter } from './adapters/minimax-chat.adapter';
import { AiProvider } from './types/ai-provider';

@Injectable()
export class AiProviderRegistryService {
    private readonly chatAdapters: ReadonlyMap<AiProvider, ChatCapabilityAdapter>;

    constructor(
        private readonly configService: ConfigService<AppConfiguration>,
        minimaxChatAdapter: MinimaxChatAdapter,
    ) {
        this.chatAdapters = new Map<AiProvider, ChatCapabilityAdapter>([['minimax', minimaxChatAdapter]]);
    }

    getChatAdapter(provider?: AiProvider): ChatCapabilityAdapter {
        const targetProvider = provider ?? this.configService.getOrThrow<AppConfiguration['ai']>('ai').chat.provider;
        const adapter = this.chatAdapters.get(targetProvider);

        if (!adapter) {
            throw new Error(`未找到 chat provider 适配器: ${targetProvider}`);
        }

        return adapter;
    }
}
