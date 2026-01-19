import { Environment } from '.';

// 生产环境配置
export const environment: Environment = {
    production: true,
    env: 'prod',
    port: parseInt(process.env.PORT || '3006', 10),
    database: {
        host: process.env.DATABASE_HOST || 'prod-db-host',
        port: parseInt(process.env.DATABASE_PORT || '3306', 10),
    },
};
