import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';
import { Column, Entity, Index, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { Base } from '../../../../../Base';
import { OrganizationEntity } from '../../../organization.entity';
import { OrganizationUserEntity } from '../../organization.user.entity';
import { OrganizationUserRbacPermissionEntity } from '../permission/organization.user.rbac.permission.entity';

@Entity({ name: 'organizations_users_roles' })
@Index([ 'organization', 'name' ], { unique: true })
export class OrganizationUserRbacRoleEntity extends Base {

  //
  // Relationships
  //
  @ApiProperty()
  @ManyToOne(type => OrganizationEntity, organization => organization.roles, {
    onDelete: 'CASCADE',
  })
  public organization?: OrganizationEntity;

  @ApiProperty()
  @ManyToMany(type => OrganizationUserRbacPermissionEntity, permission => permission.roles, { eager: true })
  public permissions?: OrganizationUserRbacPermissionEntity[];

  @ApiProperty()
  @ManyToMany(type => OrganizationUserEntity, user => user.roles)
  public users?: OrganizationUserEntity[];

  @ApiProperty()
  @ManyToMany(type => OrganizationUserRbacRoleEntity, role => role.links)
  @JoinTable({
    name: 'organizations_roles_links',
    joinColumn: { name: 'role_id' },
    inverseJoinColumn: { name: 'child_role_id' },
  })
  public links?: OrganizationUserRbacRoleEntity[];

  //
  // Properties
  //

  @ApiProperty()
  @Length(3, 55)
  @Column({ type: 'varchar', length: 55, nullable: false })
  public name?: string;

  @ApiProperty()
  @Length(1, 255)
  @Column({ type: 'varchar', length: 255, nullable: true })
  public description?: string;

}
