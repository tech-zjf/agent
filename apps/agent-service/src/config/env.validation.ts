const allowedNodeEnvs = new Set(['dev', 'beta', 'prod']);
const allowedChatProviders = new Set(['minimax']);

const assertInteger = (value: string | undefined, key: string): void => {
    if (value === undefined || value === '') {
        return;
    }

    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) {
        throw new Error(`环境变量 ${key} 必须是整数，当前值: ${value}`);
    }
};

const assertNumber = (value: string | undefined, key: string): void => {
    if (value === undefined || value === '') {
        return;
    }

    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
        throw new Error(`环境变量 ${key} 必须是数字，当前值: ${value}`);
    }
};

const assertBoolean = (value: string | undefined, key: string): void => {
    if (value === undefined || value === '') {
        return;
    }

    const normalized = value.toLowerCase();
    const allowed = ['1', '0', 'true', 'false', 'yes', 'no', 'on', 'off'];
    if (!allowed.includes(normalized)) {
        throw new Error(`环境变量 ${key} 必须是布尔值，当前值: ${value}`);
    }
};

const assertNonEmpty = (value: string | undefined, key: string): void => {
    if (!value || value.trim().length === 0) {
        throw new Error(`环境变量 ${key} 不能为空`);
    }
};

export function validateEnv(env: Record<string, unknown>): Record<string, unknown> {
    const rawNodeEnv = env.NODE_ENV;
    const nodeEnv = typeof rawNodeEnv === 'string' && rawNodeEnv.length > 0 ? rawNodeEnv : 'dev';
    if (!allowedNodeEnvs.has(nodeEnv)) {
        throw new Error(`环境变量 NODE_ENV 非法，必须是 dev|beta|prod，当前值: ${nodeEnv}`);
    }

    assertInteger(env.PORT as string | undefined, 'PORT');
    assertInteger(env.DB_PORT as string | undefined, 'DB_PORT');
    assertInteger(env.RETRIEVAL_TOP_K as string | undefined, 'RETRIEVAL_TOP_K');
    assertNumber(env.AI_CHAT_TEMPERATURE as string | undefined, 'AI_CHAT_TEMPERATURE');
    assertInteger(env.AI_CHAT_MAX_TOKENS as string | undefined, 'AI_CHAT_MAX_TOKENS');
    assertInteger(env.AI_CHAT_TIMEOUT_MS as string | undefined, 'AI_CHAT_TIMEOUT_MS');

    assertBoolean(env.DB_LOGGING as string | undefined, 'DB_LOGGING');
    assertBoolean(env.DB_SSL as string | undefined, 'DB_SSL');
    assertBoolean(env.AI_CHAT_ENABLED as string | undefined, 'AI_CHAT_ENABLED');

    const rawProvider = env.AI_CHAT_PROVIDER;
    const provider = typeof rawProvider === 'string' && rawProvider.length > 0 ? rawProvider : 'minimax';
    if (!allowedChatProviders.has(provider)) {
        throw new Error(`环境变量 AI_CHAT_PROVIDER 非法，当前仅支持 minimax，当前值: ${provider}`);
    }

    const aiChatEnabledRaw = env.AI_CHAT_ENABLED;
    const aiChatEnabled =
        aiChatEnabledRaw === true || (typeof aiChatEnabledRaw === 'string' && ['1', 'true', 'yes', 'on'].includes(aiChatEnabledRaw.toLowerCase()));

    if (aiChatEnabled && provider === 'minimax') {
        assertNonEmpty(env.MINIMAX_API_KEY as string | undefined, 'MINIMAX_API_KEY');
        assertNonEmpty(env.MINIMAX_GROUP_ID as string | undefined, 'MINIMAX_GROUP_ID');
    }

    return env;
}
