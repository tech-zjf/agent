import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    reactStrictMode: false,
    output: 'standalone',
    transpilePackages: ['@agent/utils', '@agent/types', '@agent/sdk'],
};

export default nextConfig;
