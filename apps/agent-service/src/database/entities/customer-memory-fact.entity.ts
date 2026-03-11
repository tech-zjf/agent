import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity('customer_memory_facts')
export class CustomerMemoryFactEntity {
    @PrimaryColumn({ type: 'uuid' })
    id!: string;

    @Index('idx_customer_memory_facts_customer_id')
    @Column({ name: 'customer_id', type: 'varchar', length: 64 })
    customerId!: string;

    @Column({ type: 'text' })
    fact!: string;

    @Column({ name: 'source_conversation_id', type: 'varchar', length: 64, nullable: true })
    sourceConversationId?: string | null;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt!: Date;
}
