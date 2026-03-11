export class ApiError extends Error {
    readonly code: string;
    readonly status: number;
    readonly requestId?: string;

    constructor(message: string, code = 'B0001', status = 500, requestId?: string) {
        super(message);
        this.name = 'ApiError';
        this.code = code;
        this.status = status;
        this.requestId = requestId;
    }
}
