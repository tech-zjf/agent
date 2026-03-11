import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity('tickets')
export class TicketEntity {
    @PrimaryColumn({ type: 'uuid' })
    id!: string;

    @Column({ name: 'conversation_id', type: 'varchar', length: 64 })
    conversationId!: string;

    @Index('idx_tickets_customer_id')
    @Column({ name: 'customer_id', type: 'varchar', length: 64 })
    customerId!: string;

    @Column({ type: 'varchar', length: 200 })
    title!: string;

    @Column({ type: 'text' })
    description!: string;

    @Column({ type: 'varchar', length: 20, default: 'medium' })
    priority!: 'low' | 'medium' | 'high';

    @Column({ type: 'varchar', length: 20, default: 'open' })
    status!: 'open' | 'closed';

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt!: Date;
}
