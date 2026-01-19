import { Environment } from '.';

// Beta 环境配置
export const environment: Environment = {
    production: false,
    env: 'beta',
    port: parseInt(process.env.PORT || '3006', 10),
    database: {
        host: process.env.DATABASE_HOST || 'beta-db-host',
        port: parseInt(process.env.DATABASE_PORT || '3306', 10),
    },
};
