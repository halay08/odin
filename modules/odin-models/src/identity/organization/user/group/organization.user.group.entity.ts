import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';
import { Column, Entity, Index, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { Base } from '../../../../Base';
import { DbRecordEntity } from '../../../../schema-manager/db/record/db.record.entity';
import { OrganizationEntity } from '../../organization.entity';
import { OrganizationUserEntity } from '../organization.user.entity';

@Entity({ name: 'organizations_users_groups' })
@Index([ 'organization', 'name' ], { unique: true })
export class OrganizationUserGroupEntity extends Base {

  //
  // Relationships
  //
  @ApiProperty()
  @ManyToOne(type => OrganizationEntity, organization => organization.roles, {
    onDelete: 'CASCADE',
  })
  public organization?: OrganizationEntity;

  @ManyToMany(type => DbRecordEntity, dbRecords => dbRecords.groups)
  public dbRecords?: DbRecordEntity[];

  @ManyToMany(type => OrganizationUserEntity, user => user.groups)
  public users?: OrganizationUserEntity[];

  @ManyToMany(type => OrganizationUserGroupEntity, group => group.groups)
  @JoinTable({
    name: 'organizations_users_groups_children_links',
    joinColumn: { name: 'id' },
    inverseJoinColumn: { name: 'id' },
  })
  public groups?: OrganizationUserGroupEntity[];

  //
  // Properties
  //
  @ApiProperty()
  @Length(3, 100)
  @Column({ type: 'varchar', length: 100, nullable: false })
  public name?: string;

  @ApiProperty()
  @Length(1, 160)
  @Column({ type: 'varchar', length: 160, nullable: true })
  public description?: string;

}
