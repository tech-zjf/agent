export interface ApiResponse<T> {
    code: string;
    msg: string;
    data: T;
    requestId?: string;
    path?: string;
    timestamp?: string;
}

export interface HttpRequestOptions extends Omit<RequestInit, 'body'> {
    body?: unknown;
    query?: Record<string, string | number | boolean | undefined | null>;
}
