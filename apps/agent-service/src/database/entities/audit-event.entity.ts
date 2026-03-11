import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity('audit_events')
export class AuditEventEntity {
    @PrimaryColumn({ type: 'uuid' })
    id!: string;

    @Column({ name: 'event_type', type: 'varchar', length: 80 })
    eventType!: string;

    @Column({ name: 'conversation_id', type: 'varchar', length: 64, nullable: true })
    conversationId?: string | null;

    @Column({ name: 'customer_id', type: 'varchar', length: 64, nullable: true })
    customerId?: string | null;

    @Column({ type: 'jsonb' })
    payload!: Record<string, unknown>;

    @Index('idx_audit_events_created_at')
    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt!: Date;
}
