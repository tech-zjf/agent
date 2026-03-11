# agent-desktop（Next.js）

这是一个基于 Next.js App Router 的前端应用，用于承载客服 Copilot 的界面能力（如客服工作台、知识库后台）。

## 环境变量

```bash
# 开发环境
cp .env.development.example .env.development.local

# 生产环境（部署时）
cp .env.production.example .env.production.local
```

可配置项：

1. `NEXT_PUBLIC_AGENT_API_BASE_URL`：后端 API 地址（必填）

## 本地开发

```bash
pnpm dev
```

默认访问：`http://localhost:3000`

## 常用命令

```bash
# 开发
pnpm dev

# 构建
pnpm build

# 生产启动
pnpm start
```

## 代码入口

- `src/app/page.tsx`：首页入口
- `src/app/layout.tsx`：全局布局
- `src/app/globals.css`：全局样式
- `src/services`：API 访问层封装
- `src/lib/http`：统一 HTTP 客户端（响应解包与错误处理）
- `src/tools`：工具函数（如 query string 构造）
- `src/utils`：通用工具（如 `cn`、时间格式化）
