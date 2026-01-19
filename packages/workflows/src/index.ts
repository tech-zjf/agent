import type { ImageModelAdapter, ImageToImageParams, TextToImageParams, TextToVideoParams, VideoModelAdapter } from '@agent/core';
import type { GenerationResult } from '@agent/types';
import { consoleLogger, type Logger } from '@agent/utils';

export interface WorkflowContext {
    logger?: Logger;
}

export class ImageWorkflow {
    constructor(
        private readonly provider: ImageModelAdapter,
        private readonly logger: Logger = consoleLogger,
    ) {}

    async textToImage(input: TextToImageParams): Promise<GenerationResult> {
        this.logger.info(`[workflow:image] textToImage via ${this.provider.name}`);
        return this.provider.textToImage(input);
    }

    async imageToImage(input: ImageToImageParams): Promise<GenerationResult> {
        if (!this.provider.imageToImage) {
            throw new Error(`Provider ${this.provider.name} does not support imageToImage`);
        }
        this.logger.info(`[workflow:image] imageToImage via ${this.provider.name}`);
        return this.provider.imageToImage(input);
    }
}

export class VideoWorkflow {
    constructor(
        private readonly provider: VideoModelAdapter,
        private readonly logger: Logger = consoleLogger,
    ) {}

    async textToVideo(input: TextToVideoParams): Promise<GenerationResult> {
        this.logger.info(`[workflow:video] textToVideo via ${this.provider.name}`);
        return this.provider.textToVideo(input);
    }
}
