import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfiguration } from './config';

@Injectable()
export class AppService {
    constructor(private readonly configService: ConfigService<AppConfiguration>) {}

    getHealth() {
        const app = this.configService.getOrThrow<AppConfiguration['app']>('app');
        const ai = this.configService.getOrThrow<AppConfiguration['ai']>('ai');

        return {
            status: 'ok',
            service: 'agent-service',
            env: app.env,
            port: app.port,
            ai: {
                enabled: ai.chat.enabled,
                provider: ai.chat.provider,
                model: ai.chat.model,
            },
            timestamp: new Date().toISOString(),
        };
    }
}
