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
