import { Environment } from '.';

// 基础环境配置（开发环境）
export const environment: Environment = {
    production: false,
    env: 'dev',
    port: 3006,
    database: {
        host: 'localhost',
        port: 3306,
    },
};
