import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: '客服 Copilot 工作台',
    description: '基于 Next.js + NestJS 的客服 Copilot 前端',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="zh-CN">
            <body className="antialiased">{children}</body>
        </html>
    );
}
