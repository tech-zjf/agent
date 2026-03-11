const agentApiBaseUrl = process.env.NEXT_PUBLIC_AGENT_API_BASE_URL;

if (!agentApiBaseUrl) {
    throw new Error('缺少环境变量 NEXT_PUBLIC_AGENT_API_BASE_URL');
}

export const env = {
    agentApiBaseUrl,
};
