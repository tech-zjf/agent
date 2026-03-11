import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { KnowledgeModule } from '../knowledge/knowledge.module';
import { MemoryModule } from '../memory/memory.module';
import { CopilotController } from './copilot.controller';
import { CopilotService } from './copilot.service';

@Module({
    imports: [KnowledgeModule, MemoryModule, AuditModule],
    controllers: [CopilotController],
    providers: [CopilotService],
    exports: [CopilotService],
})
export class CopilotModule {}
