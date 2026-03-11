# agent-service（NestJS）

客服 Copilot 后端服务，当前版本已支持：
1. PostgreSQL 持久化
2. TypeORM Migration 历史管理
3. 知识库检索 + 草稿回复 + 记忆 + 工单 + 审计闭环

## 安装依赖

```bash
pnpm install
```

## 环境变量

```bash
cp .env.example .env.dev
```

然后按本地实际情况修改 `.env.dev`（默认端口 `3006`，默认数据库端口 `5432`）。

## 本地数据库（推荐）

```bash
# 1) 启动 pgvector 数据库容器
pnpm run db:up

# 2) 执行 migration
pnpm run db:run
```

默认本地连接参数（已写入 `.env.dev`）：
1. host: `127.0.0.1`
2. port: `5432`
3. user: `root`（可按你本地环境修改）
4. password: `zjf012511`（可按你本地环境修改）
5. database: `agent_service`

如果数据库连接失败（`ECONNREFUSED 127.0.0.1:5432`），优先检查：
1. 容器是否启动：`pnpm run db:logs`
2. 本地 5432 端口是否被其他服务占用
3. `.env.dev` 的用户名/密码是否与数据库一致

## 启动与构建

```bash
# 开发模式
pnpm run start:dev

# 生产构建
pnpm run build

# 生产运行
pnpm run start:prod
```

## 质量检查

```bash
pnpm run lint
pnpm run test
pnpm run test:e2e
```

## 数据库迁移命令

```bash
# 创建空 migration（示例）
pnpm run db:create --name=create_xxx

# 基于实体差异生成 migration（示例）
pnpm run db:gen --name=sync_xxx

# 执行 migration
pnpm run db:run

# 回滚 migration
pnpm run db:revert
```

## 目录说明

- `src/database/entities`：数据库实体
- `src/database/migrations`：迁移历史文件
- `src/database/data-source.ts`：TypeORM CLI 配置
- `src/modules/knowledge`：知识库模块
- `src/modules/copilot`：Copilot 编排与决策
- `src/modules/memory`：短期/长期记忆
- `src/modules/tickets`：工单模块
- `src/modules/audit`：审计模块
- `src/modules/data-store`：数据库仓储实现（TypeORM Repository）

## 相关文档

- `../../docs/00-阅读导航.md`
- `../../docs/01-产品文档/01-产品架构设计.md`
- `../../docs/01-产品文档/02-MVP需求文档.md`
- `../../docs/02-开发流程/01-V1实现版本文档.md`
- `../../docs/02-开发流程/04-改动明细与原因.md`
- `../../docs/03-进阶指南/01-pgvector安装与迁移步骤.md`
