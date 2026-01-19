import { environment } from './environment';

export interface Environment {
    production: boolean;
    env: 'dev' | 'beta' | 'prod';
    port: number;
    database: {
        host: string;
        port: number;
    };
}

// ConfigFactory 函数：用于 ConfigModule.load
export const config = () => ({
    ...environment,
});

// 类型断言（用于直接使用）
export const env = environment;

// 导出环境配置
export { environment };
