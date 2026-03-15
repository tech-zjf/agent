import { Global, Module } from '@nestjs/common';
import { AiChatService } from './ai-chat.service';
import { AiProviderRegistryService } from './ai-provider-registry.service';
import { MinimaxChatAdapter } from './adapters/minimax-chat.adapter';

@Global()
@Module({
    providers: [MinimaxChatAdapter, AiProviderRegistryService, AiChatService],
    exports: [AiChatService, AiProviderRegistryService],
})
export class AiModule {}
