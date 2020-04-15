import { Column, Entity, Index } from "typeorm";
import { Base } from "@d19n/models/dist/Base";


@Entity({ name: 'notifications.mail_activity' })
@Index([ 'sg_event_id', 'sg_message_id', 'email' ], { unique: true })
export class SendgridMailEventEntity extends Base {
    @Column({ type: 'varchar', nullable: false })
    public organizationId: string;
    @Column({ type: 'varchar', nullable: false })
    public userId: string;
    @Column({ type: 'varchar', nullable: false })
    public recordId: string;
    @Column({ type: 'varchar', nullable: false })
    public email: string;
    @Column({ type: 'varchar', nullable: true })
    public ip: string;
    @Column({ type: 'varchar', nullable: true })
    public event: string;
    @Column({ type: 'integer', nullable: false })
    public timestamp: string;
    @Column({ type: 'varchar', nullable: true })
    public category: string;
    @Column({ type: 'varchar', nullable: false })
    public sg_event_id: string;
    @Column({ type: 'varchar', nullable: false })
    public sg_message_id: string;
    @Column({ type: 'varchar', nullable: true })
    public reason: string;
    @Column({ type: 'varchar', nullable: true })
    public status: string;
    @Column({ type: 'jsonb', nullable: true })
    public dynamicTemplateData: string;
}
