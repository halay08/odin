import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';
import { Column, Entity, Index, JoinColumn, ManyToMany, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { Base } from '../../Base';
import { OrganizationEntity } from '../../identity/organization/organization.entity';
import { OrganizationUserRbacPermissionEntity } from '../../identity/organization/user/rbac/permission/organization.user.rbac.permission.entity';
import { SchemaAssociationEntity } from './association/schema.association.entity';
import { SchemaColumnEntity } from './column/schema.column.entity';
import { SchemaTypeEntity } from './types/schema.type.entity';

@Entity({ name: 'schemas' })
@Index([ 'organization', 'moduleName', 'entityName' ], { unique: true })
export class SchemaEntity extends Base {

  //
  // Relationships
  //
  @ManyToOne(type => OrganizationEntity, { nullable: false })
  @JoinColumn({ name: 'organization_id', referencedColumnName: 'id' })
  public organization?: OrganizationEntity;

  @Column({ name: 'organization_id' })
  @RelationId((schema: SchemaEntity) => schema.organization) // you need to specify target
  public organizationId?: string;

  @OneToMany(type => SchemaColumnEntity, column => column.schema)
  public columns: SchemaColumnEntity[];

  @OneToMany(type => SchemaAssociationEntity, association => association.parentSchema)
  public associations: SchemaAssociationEntity[];

  @ApiProperty()
  @ManyToMany(type => OrganizationUserRbacPermissionEntity, permission => permission.schema, { eager: true })
  public permissions?: OrganizationUserRbacPermissionEntity[];

  @OneToMany(type => SchemaTypeEntity, type => type.schema, { eager: true })
  public types: SchemaTypeEntity[];


  //
  // Properties
  //
  @ApiProperty()
  @Length(3, 55)
  @Column({ type: 'varchar', length: 55, nullable: false })
  public name: string;

  @ApiProperty()
  @Column({ type: 'integer', nullable: true, default: 1 })
  public recordNumber: number;

  @ApiProperty()
  @Column({ type: 'integer', nullable: true, default: 0 })
  public position: number;

  @ApiProperty()
  @IsOptional()
  @Length(0, 55)
  @Column({ type: 'varchar', length: 55, nullable: true })
  public recordNumberPrefix: string;

  @ApiProperty()
  @Column({ type: 'uuid', nullable: true })
  public recordDefaultOwnerId?: string;

  @ApiProperty()
  @Column({ type: 'boolean', default: false, nullable: false })
  public isSequential: boolean;

  @ApiProperty()
  @IsOptional()
  @Length(0, 255)
  @Column({ type: 'varchar', length: 255, nullable: true })
  public description: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 55, nullable: false })
  public moduleName: string;

  @ApiProperty()
  @Length(2, 55)
  @Column({ type: 'varchar', length: 55, nullable: false })
  public entityName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @Column({ type: 'varchar', nullable: true, default: null })
  public searchUrl?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @Column({ type: 'varchar', nullable: true, default: null })
  public getUrl?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @Column({ type: 'varchar', nullable: true, default: null })
  public postUrl?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @Column({ type: 'varchar', nullable: true, default: null })
  public putUrl?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @Column({ type: 'varchar', nullable: true, default: null })
  public deleteUrl?: string;

  @ApiProperty()
  @IsBoolean()
  @Column({ type: 'boolean', nullable: false, default: false })
  public isStatic: boolean;

  /**
   * UI dynamic visibility property
   *  if set to hidden, it will not show up in forms
   */
  @ApiProperty()
  @Column({ type: 'boolean', default: false, nullable: false })
  public isHidden: boolean;

  /**
   * Does the schema records have a title
   */
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  @Column({ type: 'boolean', nullable: false, default: true })
  public hasTitle: boolean;

  /**
   * is the schema records title unique
   */
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  @Column({ type: 'boolean', nullable: false, default: false })
  public isTitleUnique: boolean;

  /**
   * is the schema records title required
   */
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  @Column({ type: 'boolean', nullable: false, default: false })
  public isTitleRequired: boolean;

  /**
   * determines whether the user should be able to upsert the record when creating
   * new data or if it should throw an error.
   * if false it will thrown an error if there is an existing record
   * if true it will update the existing record if it exists
   */
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  @Column({ type: 'boolean', nullable: false, default: true })
  public upsertOnCreate: boolean;

  /**
   * This property determins if the record will have a user dropdown to assign a record owner
   */
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  @Column({ type: 'boolean', nullable: false, default: false })
  public assignable: boolean;

  /**
   * is the schema records queryable
   */
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  @Column({ type: 'boolean', nullable: false, default: true })
  public queryable: boolean;

  /**
   * is the schema records replicateable
   */
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  @Column({ type: 'boolean', nullable: false, default: true })
  public replicateable: boolean;

  /**
   * is the schema records retrievable
   */
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  @Column({ type: 'boolean', nullable: false, default: true })
  public retrievable: boolean;

  /**
   * is the schema records searchable
   */
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  @Column({ type: 'boolean', nullable: false, default: true })
  public searchable: boolean;

  /**
   * is the schema records triggerable
   */
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  @Column({ type: 'boolean', nullable: false, default: true })
  public triggerable: boolean;

  /**
   * is the schemas records undeletable
   */
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  @Column({ type: 'boolean', nullable: false, default: true })
  public undeletable: boolean;

  /**
   * is the schema records updateable
   */
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  @Column({ type: 'boolean', nullable: false, default: true })
  public updateable: boolean;

}
