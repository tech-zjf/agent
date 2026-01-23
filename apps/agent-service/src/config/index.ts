export * from './environment';

export interface Environment {
    production: boolean;
    env: 'dev' | 'beta' | 'prod';
    port: number;
    database: {
        host: string;
        port: number;
    };
}
