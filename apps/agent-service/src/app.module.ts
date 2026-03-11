import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { environment } from './config';
import { AuditModule } from './modules/audit/audit.module';
import { CopilotModule } from './modules/copilot/copilot.module';
import { DataStoreModule } from './modules/data-store/data-store.module';
import { KnowledgeModule } from './modules/knowledge/knowledge.module';
import { MemoryModule } from './modules/memory/memory.module';
import { TicketsModule } from './modules/tickets/tickets.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [() => environment],
        }),
        DataStoreModule,
        KnowledgeModule,
        MemoryModule,
        AuditModule,
        TicketsModule,
        CopilotModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
