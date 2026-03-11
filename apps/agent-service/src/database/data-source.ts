import 'reflect-metadata';
import { config as dotenvConfig } from 'dotenv';
import { DataSource } from 'typeorm';

const nodeEnv = process.env.NODE_ENV || 'dev';
dotenvConfig({ path: `.env.${nodeEnv}` });
dotenvConfig();

const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbPort = Number.parseInt(process.env.DB_PORT || '5432', 10);
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || 'postgres';
const dbName = process.env.DB_NAME || 'agent_service';
const dbSchema = process.env.DB_SCHEMA || 'public';

export default new DataSource({
    type: 'postgres',
    host: dbHost,
    port: Number.isNaN(dbPort) ? 5432 : dbPort,
    username: dbUser,
    password: dbPassword,
    database: dbName,
    schema: dbSchema,
    synchronize: false,
    logging: false,
    entities: [`${__dirname}/entities/*.entity{.ts,.js}`],
    migrations: [`${__dirname}/migrations/*{.ts,.js}`],
    migrationsTableName: 'migrations_typeorm',
});
