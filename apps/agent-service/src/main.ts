import { ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './core/filters/http-exception.filter';
import { ApiResponseInterceptor } from './core/interceptor/api-response.interceptor';
import { TrimStringsPipe } from './core/pipes/trim-strings.pipe';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors({
        origin: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
    });
    const reflector = app.get(Reflector);
    app.useGlobalInterceptors(new ApiResponseInterceptor(reflector));
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalPipes(
        new TrimStringsPipe(),
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
            stopAtFirstError: true,
        }),
    );
    const configService = app.get<ConfigService>(ConfigService);
    const port = configService.get<number>('app.port') ?? 3006;
    await app.listen(port);
}

void bootstrap();
