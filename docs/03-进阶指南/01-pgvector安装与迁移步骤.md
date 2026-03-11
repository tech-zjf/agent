# pgvector 安装与接入步骤（基于当前代码）

> 当前状态：
> 1) PostgreSQL + TypeORM + migration 已落地。
> 2) 表中已预留 `embedding VECTOR(1024)` 字段。
> 3) 本地默认数据库账户：`root / zjf012511`（仅开发环境）。

## 1. 一键启动本地数据库
```bash
cd apps/agent-service
pnpm run db:up
```

查看日志：
```bash
pnpm run db:logs
```

停止容器：
```bash
pnpm run db:down
```

## 2. 执行数据库迁移
```bash
pnpm run db:run
```

回滚：
```bash
pnpm run db:revert
```

创建空 migration：
```bash
pnpm run db:create --name=add_xxx
```

基于实体差异生成 migration：
```bash
pnpm run db:gen --name=sync_xxx
```

## 3. 环境变量
在 `apps/agent-service/.env.dev`：

```bash
NODE_ENV=dev
PORT=3006
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=root
DB_PASSWORD=zjf012511
DB_NAME=agent_service
DB_SCHEMA=public
DB_SSL=false
DB_LOGGING=false
RETRIEVAL_TOP_K=3
```

## 4. 向量字段现状
已在 migration 中创建：
1. `knowledge_chunks.embedding VECTOR(1024)`
2. `customer_memory_facts.embedding VECTOR(1024)`

目前检索仍是关键词评分（token overlap），下一步接入 embedding。

## 5. 向量检索接入步骤

### Step A：Embedding 写入
1. 文档切片（300~600 字，overlap 50~100）。
2. 调用 embedding 模型生成向量。
3. 写入 `knowledge_chunks.embedding`。

### Step B：向量召回 SQL
```sql
SELECT
  id,
  article_id,
  chunk_text,
  1 - (embedding <=> $1) AS score
FROM knowledge_chunks
ORDER BY embedding <=> $1
LIMIT 5;
```

### Step C：混合检索
1. 向量召回 topN。
2. 关键词召回 topN。
3. 混合打分：`final = 0.7 * vector + 0.3 * keyword`。

### Step D：替换业务检索
把 `knowledgeService.searchArticles` 替换为：
1. 问题 embedding
2. 向量 + 关键词混合检索
3. 返回 citation 片段

## 6. 常见问题
1. `ECONNREFUSED 127.0.0.1:5432`：数据库未启动或端口冲突。
2. `CREATE EXTENSION vector` 失败：镜像不含 pgvector。
3. 维度不一致：模型维度和 `VECTOR(1024)` 不一致。
4. 检索慢：缺少索引或无分页策略。

## 7. 生产建议
1. 所有 schema 变更必须通过 migration。
2. 生产环境禁用 `synchronize`。
3. migration 先在 beta 环境演练，再跑 prod。
4. 生产密码不要用开发默认值。
