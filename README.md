# agent

基于 Next.js + NestJS + LangChain 的项目仓库。

## 客服 Copilot 文档导航

### 00-总导航
- `docs/00-阅读导航.md`

### 01-产品文档
- `docs/01-产品文档/01-产品架构设计.md`
- `docs/01-产品文档/02-MVP需求文档.md`

### 02-开发流程
- `docs/02-开发流程/00-本地启动与联调手册.md`
- `docs/02-开发流程/01-V1实现版本文档.md`
- `docs/02-开发流程/02-接口调用示例.md`
- `docs/02-开发流程/03-数据库设计.sql`
- `docs/02-开发流程/04-改动明细与原因.md`
- `docs/02-开发流程/05-学习路径与执行步骤.md`
- `docs/02-开发流程/06-模块化规范对齐说明.md`

### 03-进阶指南
- `docs/03-进阶指南/01-pgvector安装与迁移步骤.md`

## 运行

```bash
pnpm install
pnpm --filter agent-service db:up
pnpm --filter agent-service db:run
pnpm --filter agent-service start:dev
pnpm --filter agent-desktop dev
```
