import { buildQueryString } from '@/tools';
import { ApiResponse, HttpRequestOptions } from '@/types/http';
import { ApiError } from './api-error';

const SUCCESS_CODE = '00000';

const isApiEnvelope = <T>(payload: unknown): payload is ApiResponse<T> => {
    if (!payload || typeof payload !== 'object') {
        return false;
    }
    const maybePayload = payload as Partial<ApiResponse<T>>;
    return typeof maybePayload.code === 'string' && typeof maybePayload.msg === 'string' && 'data' in maybePayload;
};

export class HttpClient {
    constructor(private readonly baseUrl: string) {}

    async get<T>(path: string, options?: Omit<HttpRequestOptions, 'method' | 'body'>): Promise<T> {
        return this.request<T>(path, { ...options, method: 'GET' });
    }

    async post<T>(path: string, options?: Omit<HttpRequestOptions, 'method'>): Promise<T> {
        return this.request<T>(path, { ...options, method: 'POST' });
    }

    async request<T>(path: string, options: HttpRequestOptions = {}): Promise<T> {
        const { query, body, headers, ...requestInit } = options;
        const queryString = buildQueryString(query);
        const url = `${this.baseUrl}${path}${queryString}`;
        const requestId = globalThis.crypto?.randomUUID?.();

        const response = await fetch(url, {
            ...requestInit,
            headers: {
                'content-type': 'application/json',
                ...(requestId ? { 'x-request-id': requestId } : {}),
                ...headers,
            },
            body: body === undefined ? undefined : JSON.stringify(body),
            cache: 'no-store',
        });

        let payload: unknown;
        try {
            payload = await response.json();
        } catch {
            throw new ApiError('服务返回了非 JSON 数据', 'B0001', response.status, requestId);
        }

        if (isApiEnvelope<T>(payload)) {
            if (payload.code !== SUCCESS_CODE) {
                throw new ApiError(payload.msg || '请求失败', payload.code, response.status, payload.requestId || requestId);
            }
            return payload.data;
        }

        if (!response.ok) {
            throw new ApiError('请求失败', 'B0001', response.status, requestId);
        }

        return payload as T;
    }
}
