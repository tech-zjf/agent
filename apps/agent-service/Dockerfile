# 多阶段构建 Dockerfile for NestJS (agent-service)

# 阶段 1: 依赖安装
FROM node:20-alpine AS deps
WORKDIR /app

# 启用 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制依赖文件
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY package.json ./
COPY packages ./packages
COPY apps/agent-service/package.json ./apps/agent-service/

# 安装依赖
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

# 构建 NestJS 应用（生产环境）
RUN pnpm --filter agent-service build:prod

# 阶段 3: 运行
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# 复制构建产物和依赖
COPY --from=builder /app/apps/agent-service/dist ./dist
COPY --from=builder /app/apps/agent-service/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# 设置权限
RUN chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3006

CMD ["node", "dist/main.js"]
