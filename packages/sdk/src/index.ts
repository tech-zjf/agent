import type { GenerationRequestBase, GenerationResult, Progress } from '@agent/types';

export interface AgentSdkOptions {
    baseUrl: string;
    apiKey?: string;
}

export class AgentClient {
    private readonly baseUrl: string;
    private readonly apiKey?: string;

    constructor(options: AgentSdkOptions) {
        this.baseUrl = options.baseUrl.replace(/\/$/, '');
        this.apiKey = options.apiKey;
    }

    async createJob(payload: GenerationRequestBase): Promise<GenerationResult> {
        return this.request<GenerationResult>('/api/generation', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'content-type': 'application/json' },
        });
    }

    async getProgress(taskId: string): Promise<Progress> {
        return this.request<Progress>(`/api/generation/${taskId}/progress`, { method: 'GET' });
    }

    private async request<T>(path: string, init: RequestInit): Promise<T> {
        const headers = new Headers(init.headers);
        if (this.apiKey) {
            headers.set('authorization', `Bearer ${this.apiKey}`);
        }
        const resp = await fetch(`${this.baseUrl}${path}`, { ...init, headers });
        if (!resp.ok) {
            const text = await resp.text();
            throw new Error(`Request failed ${resp.status}: ${text}`);
        }
        return resp.json() as Promise<T>;
    }
}
