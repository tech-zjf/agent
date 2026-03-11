-- 生产环境目标数据结构（PostgreSQL + pgvector）

CREATE EXTENSION IF NOT EXISTS vector;

-- 用户表：客服、管理员、主管
CREATE TABLE users (
    id UUID PRIMARY KEY,
    role TEXT NOT NULL CHECK (role IN ('agent', 'admin', 'lead')),
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 会话表：记录客户会话基础信息与摘要
CREATE TABLE conversations (
    id UUID PRIMARY KEY,
    customer_id TEXT NOT NULL,
    channel TEXT NOT NULL,
    latest_summary TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 知识库文章主表
CREATE TABLE knowledge_articles (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'active',
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 知识切片表：用于向量检索
CREATE TABLE knowledge_chunks (
    id UUID PRIMARY KEY,
    article_id UUID NOT NULL REFERENCES knowledge_articles(id) ON DELETE CASCADE,
    chunk_text TEXT NOT NULL,
    chunk_index INT NOT NULL,
    embedding vector(1024),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_knowledge_chunks_embedding
ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 客户长期记忆事实表
CREATE TABLE customer_memory_facts (
    id UUID PRIMARY KEY,
    customer_id TEXT NOT NULL,
    fact TEXT NOT NULL,
    source_conversation_id UUID,
    embedding vector(1024),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customer_memory_fact_embedding
ON customer_memory_facts USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 工单表
CREATE TABLE tickets (
    id UUID PRIMARY KEY,
    conversation_id UUID,
    customer_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
    status TEXT NOT NULL DEFAULT 'open',
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 审计事件表
CREATE TABLE audit_events (
    id UUID PRIMARY KEY,
    conversation_id UUID,
    customer_id TEXT,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_events_created_at ON audit_events(created_at DESC);
CREATE INDEX idx_conversations_customer_id ON conversations(customer_id);
CREATE INDEX idx_tickets_customer_id ON tickets(customer_id);
