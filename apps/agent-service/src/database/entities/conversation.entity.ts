import { Column, CreateDateColumn, Entity, Index, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('conversations')
export class ConversationEntity {
    @PrimaryColumn({ type: 'varchar', length: 64 })
    id!: string;

    @Index('idx_conversations_customer_id')
    @Column({ name: 'customer_id', type: 'varchar', length: 64 })
    customerId!: string;

    @Column({ type: 'varchar', length: 32, default: 'other' })
    channel!: string;

    @Column({ name: 'latest_summary', type: 'text', default: '' })
    latestSummary!: string;

    @Column({ name: 'recent_questions', type: 'jsonb', default: () => "'[]'::jsonb" })
    recentQuestions!: string[];

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt!: Date;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt!: Date;
}
