import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity('knowledge_chunks')
export class KnowledgeChunkEntity {
    @PrimaryColumn({ type: 'uuid' })
    id!: string;

    @Index('idx_knowledge_chunks_article_id')
    @Column({ name: 'article_id', type: 'uuid' })
    articleId!: string;

    @Column({ name: 'chunk_text', type: 'text' })
    chunkText!: string;

    @Column({ name: 'chunk_index', type: 'int' })
    chunkIndex!: number;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt!: Date;
}
