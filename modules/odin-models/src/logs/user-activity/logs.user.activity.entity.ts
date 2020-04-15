import { Column, Entity, Index } from "typeorm";
import { LogsConstants } from "../logs.constants";
import { IsEnum, IsUUID } from "class-validator";
import { Base } from "../../Base";


@Entity({ name: 'logs.user_activity' })
@Index([ 'organizationId', 'recordId' ])
@Index([ 'organizationId', 'userId' ])
export class LogsUserActivityEntity extends Base {
  @Column({ type: 'varchar', nullable: false })
  @IsUUID('4')
  public organizationId: string;
  @Column({ type: 'varchar', nullable: false })
  @IsUUID('4')
  public recordId: string;
  @Column({ type: 'jsonb', nullable: false })
  public revision: any;
  @Column({ type: 'varchar', nullable: false })
  @IsUUID('4')
  public userId: string;
  @Column({ type: 'varchar', nullable: false })
  public userName: string;
  @Column({ type: 'varchar', nullable: false })
  @IsEnum(LogsConstants)
  public type: LogsConstants;
  @Column({ type: 'varchar' })
  public ipAddress?: string;
  @Column({ type: 'varchar', nullable: true })
  public userAgent?: string;
}
