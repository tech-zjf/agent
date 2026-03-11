# 客服 Copilot MVP 需求文档

## 1. 问题定义
客服在日常工作中大量时间耗在“查文档 + 改写回复”上，效率低且回复质量不稳定。

## 2. 目标用户
- 主要用户：一线客服
- 次要用户：客服主管、知识库管理员

## 3. 核心任务（Jobs To Be Done）
- 快速获得有依据的回复草稿
- 避免模型幻觉和错误承诺
- 在高风险问题上自动引导升级工单

## 4. 范围定义
### 4.1 本期范围
- 客服提问后返回：草稿回复 + 引用来源 + 置信度 + 建议动作
- 低置信度场景自动建议澄清或升级
- 知识库文章管理（增、查、搜）
- 记忆能力（短期会话摘要 + 长期客户事实）
- 审计日志记录

### 4.2 非本期范围
- 直接自动回复客户
- 替代现有 CRM 系统
- 多租户计费系统

## 5. 功能需求
1. 客服可提交问题，并携带 `conversationId`、`customerId`、`channel`。
2. 系统返回：
   - `draftReply`（回复草稿）
   - `citations`（引用）
   - `confidence`（置信度）
   - `action`（`reply` / `clarify` / `escalate`）
3. 管理员可新增和查看知识库文章。
4. 客服可一键创建升级工单。
5. 系统会更新会话摘要和客户长期事实。
6. 每次 Copilot 生成都写入审计事件。

## 6. API 清单（MVP）
- `POST /api/copilot/draft-reply`
- `POST /api/knowledge/articles`
- `GET /api/knowledge/articles`
- `GET /api/knowledge/articles/search?q=...`
- `GET /api/memory/customers/:customerId`
- `POST /api/memory/customers/:customerId/facts`
- `POST /api/tickets`
- `GET /api/tickets`
- `GET /api/audit/events?limit=50`

## 7. 非功能性要求
- 在 mock 检索下，P95 响应时间 < 2.5s
- 接口契约稳定，便于后续替换真实 LLM/向量库
- 关键动作具备可追溯性

## 8. 成功指标（MVP）
- 首次草稿返回时间 < 3s
- 至少 80% 回答包含有效引用
- 人工查资料时间降低 30%（小规模试点）
