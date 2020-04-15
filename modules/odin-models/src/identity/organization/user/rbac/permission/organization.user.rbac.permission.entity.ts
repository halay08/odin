import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';
import { Column, Entity, Index, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { Base } from '../../../../../Base';
import { SchemaColumnEntity } from '../../../../../schema-manager/schema/column/schema.column.entity';
import { SchemaEntity } from '../../../../../schema-manager/schema/schema.entity';
import { OrganizationEntity } from '../../../organization.entity';
import { OrganizationUserRbacRoleEntity } from '../role/organization.user.rbac.role.entity';
import { ORGANIZATION_USER_RBAC_PERMISSION_TYPE } from './organization.user.rbac.permission.type';

@Entity({ name: 'organizations_users_permissions' })
@Index([ 'organization', 'name' ], { unique: true })
export class OrganizationUserRbacPermissionEntity extends Base {

  //
  // Relationships
  //
  @ApiProperty()
  @ManyToOne(type => OrganizationEntity, organization => organization.permissions, { onDelete: 'CASCADE' })
  public organization?: OrganizationEntity;

  @ApiProperty()
  @ManyToMany(type => OrganizationUserRbacRoleEntity, role => role.permissions, { cascade: true })
  @JoinTable({
    name: 'organizations_users_roles_links',
    joinColumn: { name: 'permission_id' },
    inverseJoinColumn: { name: 'role_id' },
  })
  public roles?: OrganizationUserRbacRoleEntity[];

  @ApiProperty()
  @ManyToMany(type => SchemaEntity, schema => schema.permissions, { cascade: true })
  @JoinTable({
    name: 'organizations_schemas_permissions_links',
    joinColumn: { name: 'permission_id' },
    inverseJoinColumn: { name: 'schema_id' },
  })
  public schema?: SchemaEntity;

  @ApiProperty()
  @ManyToMany(type => SchemaColumnEntity, schemaColumn => schemaColumn.permissions, { cascade: true })
  @JoinTable({
    name: 'organizations_schemas_columns_permissions_links',
    joinColumn: { name: 'permission_id' },
    inverseJoinColumn: { name: 'schema_column_id' },
  })
  public schemasColumn?: SchemaColumnEntity;

  //
  // Properties
  //
  @ApiProperty()
  @Length(3, 100)
  @Column({ type: 'varchar', length: 100, nullable: false })
  public name: string;

  @ApiProperty()
  @Length(1, 160)
  @Column({ type: 'varchar', length: 160, nullable: true })
  public description: string;

  @ApiProperty()
  @Column({ type: 'enum', enum: ORGANIZATION_USER_RBAC_PERMISSION_TYPE })
  public type: ORGANIZATION_USER_RBAC_PERMISSION_TYPE;

}
