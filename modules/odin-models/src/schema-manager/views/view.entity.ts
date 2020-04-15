import { Column, DeleteDateColumn, Entity, Index, ManyToOne } from 'typeorm';
import { Base } from '../../Base';
import { OrganizationEntity } from '../../identity/organization/organization.entity';


@Entity({ name: 'db_records_views_ui' })
@Index([ 'organization' ])
@Index([ 'organization', 'key' ], { unique: true })
export class ViewEntity extends Base {

  @ManyToOne(type => OrganizationEntity, { nullable: false })
  public organization: OrganizationEntity;

  @Column({ type: 'uuid', nullable: false })
  public userId?: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  public moduleName?: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  public entityName?: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  public title?: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  public key?: string;

  @Column({ type: 'jsonb', nullable: false })
  public view?: any;

  @DeleteDateColumn()
  public deletedAt?: Date;

}
