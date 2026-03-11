import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCustomerCopilotCoreTables1762950000000 implements MigrationInterface {
    name = 'CreateCustomerCopilotCoreTables1762950000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('CREATE EXTENSION IF NOT EXISTS vector');

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS knowledge_articles (
                id UUID PRIMARY KEY,
                title VARCHAR(200) NOT NULL,
                content TEXT NOT NULL,
                tags TEXT[] NOT NULL DEFAULT '{}',
                status VARCHAR(30) NOT NULL DEFAULT 'active',
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS knowledge_chunks (
                id UUID PRIMARY KEY,
                article_id UUID NOT NULL,
                chunk_text TEXT NOT NULL,
                chunk_index INT NOT NULL,
                embedding VECTOR(1024),
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_article_id
            ON knowledge_chunks (article_id)
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS customer_memory_facts (
                id UUID PRIMARY KEY,
                customer_id VARCHAR(64) NOT NULL,
                fact TEXT NOT NULL,
                source_conversation_id VARCHAR(64),
                embedding VECTOR(1024),
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_customer_memory_facts_customer_id
            ON customer_memory_facts (customer_id)
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS conversations (
                id VARCHAR(64) PRIMARY KEY,
                customer_id VARCHAR(64) NOT NULL,
                channel VARCHAR(32) NOT NULL DEFAULT 'other',
                latest_summary TEXT NOT NULL DEFAULT '',
                recent_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_conversations_customer_id
            ON conversations (customer_id)
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS tickets (
                id UUID PRIMARY KEY,
                conversation_id VARCHAR(64) NOT NULL,
                customer_id VARCHAR(64) NOT NULL,
                title VARCHAR(200) NOT NULL,
                description TEXT NOT NULL,
                priority VARCHAR(20) NOT NULL DEFAULT 'medium',
                status VARCHAR(20) NOT NULL DEFAULT 'open',
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_tickets_customer_id
            ON tickets (customer_id)
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS audit_events (
                id UUID PRIMARY KEY,
                event_type VARCHAR(80) NOT NULL,
                conversation_id VARCHAR(64),
                customer_id VARCHAR(64),
                payload JSONB NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_audit_events_created_at
            ON audit_events (created_at DESC)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE IF EXISTS audit_events');
        await queryRunner.query('DROP TABLE IF EXISTS tickets');
        await queryRunner.query('DROP TABLE IF EXISTS conversations');
        await queryRunner.query('DROP TABLE IF EXISTS customer_memory_facts');
        await queryRunner.query('DROP TABLE IF EXISTS knowledge_chunks');
        await queryRunner.query('DROP TABLE IF EXISTS knowledge_articles');
    }
}
