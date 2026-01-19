export type GenerationKind = 'text-to-image' | 'image-to-image' | 'text-to-video' | 'image-to-video';

export type TaskStatus = 'pending' | 'running' | 'succeeded' | 'failed' | 'canceled';

export interface GenerationRequestBase {
    kind: GenerationKind;
    prompt: string;
    userId?: string;
    traceId?: string;
    tags?: string[];
    metadata?: Record<string, unknown>;
}

export interface GenerationResult {
    taskId: string;
    status: TaskStatus;
    outputUrl?: string;
    previewUrl?: string;
    errorMessage?: string;
    metadata?: Record<string, unknown>;
}

export interface Progress {
    taskId: string;
    status: TaskStatus;
    percent?: number;
    message?: string;
    etaSeconds?: number;
    metadata?: Record<string, unknown>;
}
