import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
    let appController: AppController;

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [AppController],
            providers: [
                AppService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: (key: string) => {
                            if (key === 'env') {
                                return 'dev';
                            }
                            if (key === 'port') {
                                return 3006;
                            }

                            return undefined;
                        },
                    },
                },
            ],
        }).compile();

        appController = app.get<AppController>(AppController);
    });

    describe('health', () => {
        it('should return service status payload', () => {
            const payload = appController.getHealth();
            expect(payload.status).toBe('ok');
            expect(payload.service).toBe('agent-service');
            expect(payload.env).toBe('dev');
            expect(payload.port).toBe(3006);
            expect(typeof payload.timestamp).toBe('string');
        });
    });
});
