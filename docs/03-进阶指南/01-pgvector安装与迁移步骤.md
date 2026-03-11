# pgvector 安装与迁移步骤（从内存仓储到真实向量检索）

> 目标：把当前 `DataStoreService`（内存）迁移到 `PostgreSQL + pgvector`，让知识检索升级为可扩展的向量检索。

## 0. 前置说明
当前版本检索策略是 token overlap（关键词重叠）。
迁移后建议使用：
1. 向量检索（语义召回）
2. 关键词检索（精确约束）
3. 混合排序（提升稳定性）

## 1. 本地安装 PostgreSQL 与 pgvector

### 方案 A（推荐）：Docker
```bash
docker run -d \
  --name copilot-pg \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=copilot \
  -p 5432:5432 \
  ankane/pgvector
```

验证连接：
```bash
psql "postgresql://postgres:postgres@localhost:5432/copilot" -c "SELECT version();"
```

### 方案 B：本机安装（macOS）
```bash
brew install postgresql@16
brew services start postgresql@16
brew install pgvector
```

进入数据库后启用扩展：
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

## 2. 建表与索引
执行：`../02-开发流程/03-数据库设计.sql`

```bash
psql "postgresql://postgres:postgres@localhost:5432/copilot" \
  -f docs/customer-copilot/02-开发流程/03-数据库设计.sql
```

验证：
```sql
\dt
\dx
```

## 3. 配置后端连接参数
在 `apps/agent-service/src/config/*` 或 `.env` 中增加：
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/copilot
PGVECTOR_DIM=1024
```

建议新增配置项：
1. `embeddingDimension`
2. `vectorTopK`
3. `hybridSearchWeight`

## 4. 引入 ORM / Query 层（建议）
可选方案：
1. 直接 `pg` + SQL（最轻）
2. Prisma + 原生 SQL（开发体验好）
3. TypeORM（与 Nest 生态贴近）

MVP 建议：先用 `pg + SQL`，避免 ORM 学习成本阻塞。

## 5. 迁移 DataStore 到 Repository

## 5.1 新增 Repository 接口
按当前 DataStore 能力拆为：
1. `KnowledgeRepository`
2. `MemoryRepository`
3. `TicketRepository`
4. `AuditRepository`

## 5.2 先保留内存实现，再新增 Postgres 实现
- `InMemoryKnowledgeRepository`
- `PgKnowledgeRepository`

通过 Nest provider token 切换实现，避免一次性重写所有业务逻辑。

## 6. 接入 Embedding 生成

## 6.1 生成时机
1. 文章创建后异步切片。
2. 对每个 chunk 生成 embedding。
3. 入库 `knowledge_chunks.embedding`。

## 6.2 切片建议
1. chunk 大小：300~600 中文字。
2. overlap：50~100 字。
3. 保留 `chunk_index` 便于引用回溯。

## 6.3 SQL 检索示例（余弦距离）
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

## 7. 混合检索建议（向量 + 关键词）

## 7.1 关键词召回
可用 `tsvector` 或简单 ILIKE 进行首轮过滤。

## 7.2 混合打分
示例：
1. `finalScore = 0.7 * vectorScore + 0.3 * keywordScore`
2. 再做去重和同文档聚合。

## 8. 改造 CopilotService
把以下逻辑替换为真实检索：
1. 旧逻辑：`knowledgeService.searchArticles(question)`
2. 新逻辑：`retrievalService.retrieve(questionEmbedding, questionText)`

保持返回结构不变：
1. `citations`
2. `confidence`
3. `action`

这样前端和调用方不用改。

## 9. 数据迁移与回填
如果你已经有内存 seed 或历史文章：
1. 先导入 `knowledge_articles`。
2. 批量切片写入 `knowledge_chunks`。
3. 批量生成 embedding 并回填。
4. 对 `embedding` 建 ivfflat 索引。

## 10. 验证清单
1. 同义问法是否命中相同知识条目。
2. citations 是否能回溯到文章与片段。
3. 低命中时是否触发 `clarify/escalate`。
4. 接口 P95 延迟是否满足目标。

## 11. 常见问题
1. `CREATE EXTENSION vector` 失败：数据库没有安装 pgvector 扩展包。
2. 维度不一致：embedding 维度与 `vector(1024)` 不一致。
3. 召回不稳定：chunk 太大/太小，或 overlap 设置不合理。
4. SQL 慢：未建向量索引或列表参数过小。

## 12. 建议的迭代顺序（最稳）
1. 先跑通 Postgres 普通表读写。
2. 再接入向量字段与检索。
3. 再接入真实 Embedding。
4. 最后做混合检索与重排。
