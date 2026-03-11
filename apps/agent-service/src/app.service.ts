import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
    constructor(private readonly configService: ConfigService) {}

    getHealth() {
        const env = this.configService.get<string>('env') ?? 'dev';
        const port = this.configService.get<number>('port') ?? 3006;

        return {
            status: 'ok',
            service: 'agent-service',
            env,
            port,
            timestamp: new Date().toISOString(),
        };
    }
}
