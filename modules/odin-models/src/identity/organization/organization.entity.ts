import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';
import { Column, Entity, Index, OneToMany } from 'typeorm';
import { Base } from '../../Base';
import { OrganizationAppEntity } from './app/organization.app.entity';
import { OrganizationUserGroupEntity } from './user/group/organization.user.group.entity';
import { OrganizationUserEntity } from './user/organization.user.entity';
import { OrganizationUserRbacPermissionEntity } from './user/rbac/permission/organization.user.rbac.permission.entity';
import { OrganizationUserRbacRoleEntity } from './user/rbac/role/organization.user.rbac.role.entity';

@Entity({ name: 'organizations' })
@Index([ 'name' ], { unique: true })
export class OrganizationEntity extends Base {

  //
  // Relationships
  //
  @ApiProperty()
  @OneToMany(type => OrganizationUserRbacRoleEntity, roles => roles.organization)
  public roles?: OrganizationUserRbacRoleEntity[];

  @ApiProperty()
  @OneToMany(type => OrganizationUserRbacPermissionEntity, permissions => permissions.organization)
  public permissions?: OrganizationUserRbacPermissionEntity[];

  @ApiProperty()
  @OneToMany(type => OrganizationUserGroupEntity, groups => groups.organization)
  public groups?: OrganizationUserGroupEntity[];

  @ApiProperty()
  @OneToMany(type => OrganizationUserEntity, user => user.organization)
  public users?: OrganizationUserEntity[];

  @ApiProperty()
  @OneToMany(type => OrganizationAppEntity, connectedApp => connectedApp.organization)
  public connectedApps?: OrganizationAppEntity[];

  //
  // Properties
  //
  @ApiProperty()
  @Length(1, 100)
  @Column({ type: 'varchar', length: 100, nullable: false })
  public name?: string;

  @ApiProperty()
  @Length(1, 32)
  @Column({ type: 'varchar', length: 32, nullable: true })
  public countryCode?: string;

  @ApiProperty()
  @Length(1, 32)
  @Column({ type: 'varchar', length: 32, nullable: true })
  public timezoneName?: string;

  @ApiProperty()
  @Length(1, 32)
  @Column({ type: 'varchar', length: 32, nullable: true })
  public timezoneOffset?: string;

  @ApiProperty()
  @Length(1, 32)
  @Column({ type: 'varchar', length: 32, nullable: true })
  public locale?: string;

  @ApiProperty()
  @Length(1, 32)
  @Column({ type: 'varchar', length: 32, nullable: true })
  public einNumber?: string;

  @ApiProperty()
  @Length(1, 32)
  @Column({ type: 'varchar', length: 32, nullable: true })
  public vatNumber?: string;

  @ApiProperty()
  @Column({ type: 'integer', nullable: true, default: 100 })
  public maxForms?: number;

  @ApiProperty()
  @Column({ type: 'integer', nullable: true, default: 100 })
  public maxSchemas?: number;

  @ApiProperty()
  @Column({ type: 'integer', nullable: true, default: 100 })
  public maxSchemaColumns?: number;

  @ApiProperty()
  @Length(0, 100)
  @Column({ type: 'varchar', length: 100, nullable: true, default: null })
  public billingReplyToEmail?: string;

  @ApiProperty()
  @Length(0, 100)
  @Column({ type: 'varchar', length: 100, nullable: true, default: null })
  public customerServiceReplyToEmail?: string;

  @ApiProperty()
  @Length(0, 100)
  @Column({ type: 'varchar', length: 100, nullable: true, default: null })
  public webUrl?: string

}
