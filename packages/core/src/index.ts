import { GenerationResult, Progress } from '@agent/types';

export type ProviderCapability = 'image' | 'video';

export interface ProviderContext {
    apiKey?: string;
    model?: string;
    extras?: Record<string, unknown>;
}

export interface TextToImageParams {
    prompt: string;
    negativePrompt?: string;
    width?: number;
    height?: number;
    steps?: number;
    seed?: number;
}

export interface ImageToImageParams extends TextToImageParams {
    imageUrl: string;
    strength?: number;
}

export interface TextToVideoParams {
    prompt: string;
    durationSeconds?: number;
    seed?: number;
    fps?: number;
}

export interface ImageToVideoParams extends TextToVideoParams {
    imageUrl: string;
}

export interface ImageModelAdapter {
    name: string;
    textToImage(input: TextToImageParams, ctx?: ProviderContext): Promise<GenerationResult>;
    imageToImage?(input: ImageToImageParams, ctx?: ProviderContext): Promise<GenerationResult>;
    getProgress?(taskId: string): Promise<Progress>;
}

export interface VideoModelAdapter {
    name: string;
    textToVideo(input: TextToVideoParams, ctx?: ProviderContext): Promise<GenerationResult>;
    imageToVideo?(input: ImageToVideoParams, ctx?: ProviderContext): Promise<GenerationResult>;
    getProgress?(taskId: string): Promise<Progress>;
}

export class ProviderRegistry<TAdapter> {
    private readonly providers = new Map<string, TAdapter>();

    register(name: string, adapter: TAdapter) {
        this.providers.set(name, adapter);
    }

    get(name: string): TAdapter | undefined {
        return this.providers.get(name);
    }

    list(): string[] {
        return Array.from(this.providers.keys());
    }
}
