import type { ImageModelAdapter, ProviderRegistry, VideoModelAdapter } from '@agent/core';
import { consoleLogger, type Logger } from '@agent/utils';

export interface ProviderRegistryOptions {
    logger?: Logger;
}

export class UnifiedProviderRegistry {
    private readonly imageRegistry: ProviderRegistry<ImageModelAdapter>;
    private readonly videoRegistry: ProviderRegistry<VideoModelAdapter>;
    private readonly logger: Logger;

    constructor(imageRegistry: ProviderRegistry<ImageModelAdapter>, videoRegistry: ProviderRegistry<VideoModelAdapter>, options?: ProviderRegistryOptions) {
        this.imageRegistry = imageRegistry;
        this.videoRegistry = videoRegistry;
        this.logger = options?.logger ?? consoleLogger;
    }

    registerImage(adapter: ImageModelAdapter) {
        this.imageRegistry.register(adapter.name, adapter);
        this.logger.info(`Registered image provider ${adapter.name}`);
    }

    registerVideo(adapter: VideoModelAdapter) {
        this.videoRegistry.register(adapter.name, adapter);
        this.logger.info(`Registered video provider ${adapter.name}`);
    }

    getImage(name: string) {
        return this.imageRegistry.get(name);
    }

    getVideo(name: string) {
        return this.videoRegistry.get(name);
    }

    list() {
        return {
            image: this.imageRegistry.list(),
            video: this.videoRegistry.list(),
        };
    }
}
