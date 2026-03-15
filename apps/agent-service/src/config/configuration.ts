export type RuntimeEnv = 'dev' | 'beta' | 'prod';
export type ChatProvider = 'minimax';

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
    ai: {
        chat: {
            enabled: boolean;
            provider: ChatProvider;
            model: string;
            temperature: number;
            maxTokens: number;
            timeoutMs: number;
        };
        providers: {
            minimax: {
                apiKey: string;
                groupId: string;
                baseUrl: string;
            };
        };
    };
}

const parseBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
    if (value === undefined || value === '') {
        return defaultValue;
    }

    return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
};

const parseInteger = (value: string | undefined, defaultValue: number): number => {
    if (!value) {
        return defaultValue;
    }

    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? defaultValue : parsed;
};

const parseNumber = (value: string | undefined, defaultValue: number): number => {
    if (!value) {
        return defaultValue;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? defaultValue : parsed;
};

export default (): AppConfiguration => ({
    app: {
        env: (process.env.NODE_ENV as RuntimeEnv) || 'dev',
        port: parseInteger(process.env.PORT, 3006),
    },
    database: {
        type: 'postgres',
        host: process.env.DB_HOST || '127.0.0.1',
        port: parseInteger(process.env.DB_PORT, 5432),
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'agent_service',
        schema: process.env.DB_SCHEMA || 'public',
        logging: parseBoolean(process.env.DB_LOGGING, false),
        ssl: parseBoolean(process.env.DB_SSL, false),
    },
    retrieval: {
        topK: parseInteger(process.env.RETRIEVAL_TOP_K, 3),
    },
    ai: {
        chat: {
            enabled: parseBoolean(process.env.AI_CHAT_ENABLED, false),
            provider: (process.env.AI_CHAT_PROVIDER as ChatProvider) || 'minimax',
            model: process.env.AI_CHAT_MODEL || 'abab5.5-chat',
            temperature: parseNumber(process.env.AI_CHAT_TEMPERATURE, 0.2),
            maxTokens: parseInteger(process.env.AI_CHAT_MAX_TOKENS, 800),
            timeoutMs: parseInteger(process.env.AI_CHAT_TIMEOUT_MS, 15000),
        },
        providers: {
            minimax: {
                apiKey: process.env.MINIMAX_API_KEY || '',
                groupId: process.env.MINIMAX_GROUP_ID || '',
                baseUrl: process.env.MINIMAX_BASE_URL || 'https://api.minimax.chat/v1',
            },
        },
    },
});
