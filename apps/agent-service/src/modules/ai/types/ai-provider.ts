export const aiProviders = ['minimax'] as const;
export type AiProvider = (typeof aiProviders)[number];

export const aiCapabilities = ['chat', 'image', 'video'] as const;
export type AiCapability = (typeof aiCapabilities)[number];
