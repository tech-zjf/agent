import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('knowledge_articles')
export class KnowledgeArticleEntity {
    @PrimaryColumn({ type: 'uuid' })
    id!: string;

    @Column({ type: 'varchar', length: 200 })
    title!: string;

    @Column({ type: 'text' })
    content!: string;

    @Column({ type: 'text', array: true, default: '{}' })
    tags!: string[];

    @Column({ type: 'varchar', length: 30, default: 'active' })
    status!: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt!: Date;
}
