import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configuration, validateEnv } from './config';
import { RequestContextMiddleware } from './core/middleware/request-context.middleware';
import { DatabaseModule } from './database/database.module';
import { AiModule } from './modules/ai/ai.module';
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
            cache: true,
            envFilePath: [`.env.${process.env.NODE_ENV || 'dev'}`, '.env'],
            validate: validateEnv,
            load: [configuration],
        }),
        AiModule,
        DatabaseModule,
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
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer.apply(RequestContextMiddleware).forRoutes({
            path: '*',
            method: RequestMethod.ALL,
        });
    }
}
