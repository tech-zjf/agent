export interface ApiCodeStatus {
    code: string;
    msg: string;
}

export const ApiCode = {
    OK: { code: '00000', msg: 'ok' },

    VALIDATE_PARAMS_ERROR: { code: 'A0001', msg: '请求参数错误' },
    UNAUTHORIZED: { code: 'A0006', msg: '您还未登录' },

    SYSTEM_ERROR: { code: 'B0001', msg: '系统错误' },
    ROUTER_NOT_FOUND: { code: 'B0004', msg: '接口不存在' },
} as const;
