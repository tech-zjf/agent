export type RuntimeEnv = 'dev' | 'beta' | 'prod';

export interface AppConfiguration {
    app: {
        env: RuntimeEnv;
        port: number;
    };
    database: {
        type: 'postgres';
        host: string;
        port: number;
        username: string;
        password: string;
        database: string;
        schema: string;
        logging: boolean;
        ssl: boolean;
    };
    retrieval: {
        topK: number;
    };
}

const parseBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
    if (value === undefined || value === '') {
        return defaultValue;
    }

    return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
};

const parseNumber = (value: string | undefined, defaultValue: number): number => {
    if (!value) {
        return defaultValue;
    }

    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? defaultValue : parsed;
};

export default (): AppConfiguration => ({
    app: {
        env: (process.env.NODE_ENV as RuntimeEnv) || 'dev',
        port: parseNumber(process.env.PORT, 3006),
    },
    database: {
        type: 'postgres',
        host: process.env.DB_HOST || '127.0.0.1',
        port: parseNumber(process.env.DB_PORT, 5432),
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'agent_service',
        schema: process.env.DB_SCHEMA || 'public',
        logging: parseBoolean(process.env.DB_LOGGING, false),
        ssl: parseBoolean(process.env.DB_SSL, false),
    },
    retrieval: {
        topK: parseNumber(process.env.RETRIEVAL_TOP_K, 3),
    },
});
