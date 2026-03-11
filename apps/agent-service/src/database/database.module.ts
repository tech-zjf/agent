import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppConfiguration } from '../config';
import { DATABASE_ENTITIES } from './entities';

@Global()
@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService<AppConfiguration>): TypeOrmModuleOptions => {
                const database = configService.get<AppConfiguration['database']>('database');
                if (!database) {
                    throw new Error('数据库配置缺失，请检查环境变量');
                }
                return {
                    type: 'postgres',
                    host: database.host,
                    port: database.port,
                    username: database.username,
                    password: database.password,
                    database: database.database,
                    schema: database.schema,
                    synchronize: false,
                    logging: database.logging,
                    ssl: database.ssl ? { rejectUnauthorized: false } : false,
                    autoLoadEntities: false,
                    entities: [...DATABASE_ENTITIES],
                    migrationsTableName: 'migrations_typeorm',
                };
            },
        }),
    ],
    exports: [TypeOrmModule],
})
export class DatabaseModule {}
