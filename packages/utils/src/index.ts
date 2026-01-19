export interface Logger {
    debug: (message: string, meta?: unknown) => void;
    info: (message: string, meta?: unknown) => void;
    warn: (message: string, meta?: unknown) => void;
    error: (message: string, meta?: unknown) => void;
}

export const consoleLogger: Logger = {
    debug: (message, meta) => console.debug(message, meta),
    info: (message, meta) => console.info(message, meta),
    warn: (message, meta) => console.warn(message, meta),
    error: (message, meta) => console.error(message, meta),
};

export function ensureEnv(key: string, reader: (k: string) => string | undefined = (k) => process.env[k]) {
    const value = reader(key);
    if (!value) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
}
