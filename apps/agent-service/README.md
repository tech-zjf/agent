# agent-service（NestJS）

客服 Copilot 的后端服务，当前版本聚焦 MVP：知识库检索、回复草稿生成、记忆与工单升级闭环。

## 安装依赖

```bash
pnpm install
```

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
# 代码检查
pnpm run lint

# 单元测试
pnpm run test

# e2e 测试
pnpm run test:e2e
```

## 目录说明

- `src/modules/knowledge`：知识库模块
- `src/modules/copilot`：Copilot 编排与决策
- `src/modules/memory`：短期/长期记忆
- `src/modules/tickets`：工单模块
- `src/modules/audit`：审计模块
- `src/modules/data-store`：MVP 内存仓储

## 相关文档

- `../../docs/customer-copilot/00-阅读导航.md`
- `../../docs/customer-copilot/01-产品文档/01-产品架构设计.md`
- `../../docs/customer-copilot/01-产品文档/02-MVP需求文档.md`
- `../../docs/customer-copilot/02-开发流程/01-V1实现版本文档.md`
- `../../docs/customer-copilot/02-开发流程/04-改动明细与原因.md`
- `../../docs/customer-copilot/03-进阶指南/01-pgvector安装与迁移步骤.md`
