# 多阶段构建 Dockerfile for Next.js (agent-desktop)

# 阶段 1: 依赖安装
FROM node:20-alpine AS deps
WORKDIR /app

# 启用 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制依赖文件
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY package.json ./
COPY packages ./packages
COPY apps/agent-desktop/package.json ./apps/agent-desktop/

# 安装依赖（包括 workspace 包）
RUN pnpm install --frozen-lockfile

# 阶段 2: 构建
FROM node:20-alpine AS builder
WORKDIR /app

# 启用 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制依赖和源码
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY . .

# 构建 Next.js 应用
RUN pnpm --filter agent-desktop build

# 阶段 3: 运行
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制构建产物和必要文件
COPY --from=builder /app/apps/agent-desktop/.next/standalone ./
COPY --from=builder /app/apps/agent-desktop/.next/static ./apps/agent-desktop/.next/static
COPY --from=builder /app/apps/agent-desktop/public ./apps/agent-desktop/public

# 设置权限
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/agent-desktop/server.js"]
