import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { KnowledgeModule } from '../knowledge/knowledge.module';
import { MemoryModule } from '../memory/memory.module';
import { CopilotController } from './copilot.controller';
import { CopilotAgentService } from './copilot-agent.service';
import { CopilotService } from './copilot.service';

@Module({
    imports: [KnowledgeModule, MemoryModule, AuditModule],
    controllers: [CopilotController],
    providers: [CopilotService, CopilotAgentService],
    exports: [CopilotService],
})
export class CopilotModule {}
