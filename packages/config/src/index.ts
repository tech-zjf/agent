type EnvReader = (key: string) => string | undefined;

const defaultReader: EnvReader = (key) => process.env[key];

export type ConfigShape = Record<string, string | undefined>;

export interface LoadConfigOptions<T extends ConfigShape> {
    required?: (keyof T)[];
    reader?: EnvReader;
}

export function loadConfig<T extends ConfigShape>(defaults: T, options: LoadConfigOptions<T> = {}): T {
    const reader = options.reader ?? defaultReader;
    const merged = { ...defaults };
    Object.keys(defaults).forEach((key) => {
        const value = reader(key);
        if (typeof value !== 'undefined') {
            merged[key as keyof T] = value as T[keyof T];
        }
    });

    if (options.required) {
        const missing = options.required.filter((key) => !merged[key]);
        if (missing.length) {
            throw new Error(`Missing required config keys: ${missing.join(', ')}`);
        }
    }

    return merged;
}
