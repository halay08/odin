import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsOptional, Length } from 'class-validator';
import { Column, Entity, Index, JoinColumn, ManyToMany, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { Base } from '../../../Base';
import { OrganizationEntity } from '../../../identity/organization/organization.entity';
import { OrganizationUserRbacPermissionEntity } from '../../../identity/organization/user/rbac/permission/organization.user.rbac.permission.entity';
import { SchemaEntity } from '../schema.entity';
import { SchemaTypeEntity } from '../types/schema.type.entity';
import { SchemaColumnOptionEntity } from './option/schema.column.option.entity';
import { SchemaColumnTypes } from './types/schema.column.types';
import { SchemaColumnValidatorEntity } from './validator/schema.column.validator.entity';

/**
 * Database entity for schema column.
 */
@Entity({ name: 'schemas_columns' })
@Index([ 'organization', 'schema', 'schemaType', 'name' ], { unique: true })
export class SchemaColumnEntity extends Base {

  /**
   * Owning organization.
   */
  @ManyToOne(type => OrganizationEntity, { nullable: false })
  @JoinColumn({ name: 'organization_id', referencedColumnName: 'id' })
  public organization?: OrganizationEntity;

  @Column({ name: 'organization_id' })
  @RelationId((schemaColumn: SchemaColumnEntity) => schemaColumn.organization) // you need to specify target
  public organizationId?: string;

  /**
   * Owning schema.
   */
  @ManyToOne(type => SchemaEntity, schema => schema.columns, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'schema_id', referencedColumnName: 'id' })
  public schema: SchemaEntity;

  @Column({ name: 'schema_id' })
  @RelationId((schemaColumn: SchemaColumnEntity) => schemaColumn.schema) // you need to specify target
  public schemaId?: string;

  // ODN-1201
  @ManyToOne(type => SchemaTypeEntity, type => type.schemaColumn, { nullable: true })
  @JoinColumn({ name: 'schema_type_id', referencedColumnName: 'id' })
  public schemaType?: SchemaTypeEntity;

  // ODN-1201
  @Column({ name: 'schema_type_id' })
  @RelationId((schemaColumn: SchemaColumnEntity) => schemaColumn.schemaType) // you need to specify target
  public schemaTypeId?: string;

  /**
   * Owning schema.
   */
  @OneToMany(type => SchemaColumnOptionEntity, options => options.column, { cascade: true })
  public options: SchemaColumnOptionEntity[];

  /**
   * Column validators .
   */
  @OneToMany(type => SchemaColumnValidatorEntity, validators => validators.column, { cascade: true })
  public validators: SchemaColumnValidatorEntity[];

  @ApiProperty()
  @ManyToMany(type => OrganizationUserRbacPermissionEntity, permission => permission.schemasColumn, { eager: true })
  public permissions?: OrganizationUserRbacPermissionEntity[]

  /**
   * Column name.
   */
  @ApiProperty()
  @Length(3, 32)
  @Column({ type: 'varchar', length: 32, nullable: false })
  public name: string;

  /**
   * Column name mapping to an external system name
   */
  @ApiProperty()
  @IsOptional()
  @Length(0, 32)
  @Column({ type: 'varchar', length: 32, nullable: false })
  public mapping?: string;

  /**
   * Column type.
   */
  @ApiProperty()
  @IsEnum(SchemaColumnTypes)
  @Column({ type: 'varchar', length: 55, nullable: false })
  public type: SchemaColumnTypes;

  /**
   * Column description (optional).
   */
  @ApiProperty()
  @Length(0, 255)
  @Column({ type: 'varchar', length: 255, nullable: true })
  public description: string;

  /**
   * Column defaultValue.
   */
  @ApiProperty()
  @IsOptional()
  // @Length(0, 55)
  @Column({ type: 'varchar', length: 55, nullable: true })
  public defaultValue?: any;

  /**
   * Column label for forms(optional).
   */
  @ApiProperty()
  @IsOptional()
  @Length(0, 55)
  @Column({ type: 'varchar', length: 55, nullable: true })
  public label?: string;

  /**
   * Column placeholder for forms.
   */
  @ApiProperty()
  @IsOptional()
  @Length(0, 55)
  @Column({ type: 'varchar', length: 55, nullable: true })
  public placeholder?: string;

  /**
   * Position (vertical ordering when rendering forms and descriptions).
   * @type {number} defaults to 0 meaning sort by name.
   */
  @ApiProperty()
  @IsNumber()
  @Column({ type: 'integer', nullable: false, default: 0 })
  public position: number;

  /**
   * Column Position (horizontal ordering when rendering forms and descriptions).
   * @type {number} defaults to 0 meaning sort by name.
   */
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  @Column({ type: 'integer', nullable: false, default: 1 })
  public columnPosition?: number;

  /**
   * Column isStatic.
   */
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  @Column({ type: 'boolean', nullable: false, default: false })
  public isStatic?: boolean;

  /**
   * Column isHidden from forms.
   */
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  @Column({ type: 'boolean', nullable: false, default: false })
  public isHidden?: boolean;

  /**
   * Column isVisibleInTables
   * sets the default visibility in data tables
   */
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  @Column({ type: 'boolean', nullable: false, default: true })
  public isVisibleInTables?: boolean;

  /**
   * Column isDisabled in forms.
   */
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  @Column({ type: 'boolean', nullable: true, default: false })
  public isDisabled?: boolean;

  /**
   * Column isTitleColumn from forms.
   */
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  @Column({ type: 'boolean', nullable: true, default: false })
  public isTitleColumn?: boolean;

  /**
   * Column isStatusColumn from forms.
   */
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  @Column({ type: 'boolean', nullable: true, default: false })
  public isStatusColumn?: boolean;

  /**
   * Column transform
   * LOWERCASE, UPPERCASE, PASCAL_CASE, CAMEL_CASE, SNAKE_CASE
   */
  @ApiProperty()
  @IsOptional()
  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  public transform?: string;

  /**
   * Column category.
   */
  @ApiProperty()
  @IsOptional()
  @Column({ type: 'varchar', nullable: true, default: null })
  public category?: string;

  /**
   * Transform dbRecord column values
   * @param columnValues
   */
  public static transform(columnValues: SchemaColumnEntity[]) {

    let transformed = {};

    if(Array.isArray(columnValues)) {
      for(let i = 0; i < columnValues.length; i++) {
        const obj = columnValues[i];
        transformed = Object.assign({}, transformed, { [obj.name]: obj.defaultValue });
      }
    }

    return { content: transformed };

  }

}
