const allowedNodeEnvs = new Set(['dev', 'beta', 'prod']);

const assertInteger = (value: string | undefined, key: string): void => {
    if (value === undefined || value === '') {
        return;
    }

    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) {
        throw new Error(`环境变量 ${key} 必须是整数，当前值: ${value}`);
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

export function validateEnv(env: Record<string, unknown>): Record<string, unknown> {
    const rawNodeEnv = env.NODE_ENV;
    const nodeEnv = typeof rawNodeEnv === 'string' && rawNodeEnv.length > 0 ? rawNodeEnv : 'dev';
    if (!allowedNodeEnvs.has(nodeEnv)) {
        throw new Error(`环境变量 NODE_ENV 非法，必须是 dev|beta|prod，当前值: ${nodeEnv}`);
    }

    assertInteger(env.PORT as string | undefined, 'PORT');
    assertInteger(env.DB_PORT as string | undefined, 'DB_PORT');
    assertInteger(env.RETRIEVAL_TOP_K as string | undefined, 'RETRIEVAL_TOP_K');

    assertBoolean(env.DB_LOGGING as string | undefined, 'DB_LOGGING');
    assertBoolean(env.DB_SSL as string | undefined, 'DB_SSL');

    return env;
}
