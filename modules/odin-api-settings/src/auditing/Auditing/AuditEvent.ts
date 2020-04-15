import { Column, Entity } from "typeorm";
import { Base }           from '../../BaseModel';
import { AuditEventType } from './AuditEventType';

@Entity({ name: 'audit_log' })
export class AuditEvent extends Base {

    @Column()
    public type?: AuditEventType;

    @Column()
    public payload?: string;

}
