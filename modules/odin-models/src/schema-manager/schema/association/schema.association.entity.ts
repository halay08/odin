import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Column, Entity, Index, JoinColumn, ManyToOne, RelationId } from 'typeorm';
import { Base } from '../../../Base';
import { OrganizationEntity } from '../../../identity/organization/organization.entity';
import { SchemaEntity } from '../schema.entity';
import { SchemaAssociationCardinalityTypes } from './types/schema.association.cardinality.types';

@Entity({ name: 'schemas_associations' })
@Index([ 'organization', 'parentSchema', 'childSchema', 'label' ], { unique: true })
export class SchemaAssociationEntity extends Base {

  //
  // Relationships
  //
  @ManyToOne(type => OrganizationEntity, { nullable: false })
  @JoinColumn({ name: 'organization_id', referencedColumnName: 'id' })
  public organization?: OrganizationEntity;

  @Column({ name: 'organization_id' })
  @RelationId((schemaAssociation: SchemaAssociationEntity) => schemaAssociation.organization) // you need to specify
  public organizationId?: string;

  @ManyToOne(type => SchemaEntity, schemas => schemas.associations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_schema_id', referencedColumnName: 'id' })
  public parentSchema?: SchemaEntity;

  @Column({ name: 'parent_schema_id' })
  @RelationId((schemaAssociation: SchemaAssociationEntity) => schemaAssociation.parentSchema) // you need to specify
  public parentSchemaId?: string;

  @ManyToOne(type => SchemaEntity, schemas => schemas.associations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'child_schema_id', referencedColumnName: 'id' })
  public childSchema: SchemaEntity;

  @Column({ name: 'child_schema_id' })
  @RelationId((schemaAssociation: SchemaAssociationEntity) => schemaAssociation.childSchema) // you need to specify
  public childSchemaId?: string;

  //
  // Properties
  //
  @ApiProperty({
    description: 'A unique reference to this association',
    example: 'Account Related Contacts',
  })
  @Column({ nullable: false })
  public label: string;

  /**
   * ENUM [ "ONE_TO_ONE", "ONE_TO_MANY", "MANY_TO_MANY" ]
   * the direction is source -> target [SOURCE]_TO_[TARGET]
   */
  @ApiProperty({
    description: 'The relationship between the source and target',
    example: 'ONE_TO_ONE | ONE_TO_MANY | MANY_TO_MANY',
  })
  @Column({
    type: 'enum',
    enum: SchemaAssociationCardinalityTypes,
    nullable: false,
  })
  public type: SchemaAssociationCardinalityTypes;

  /**
   * Position (ordering when rendering).
   * @type {number} defaults to 0 meaning sort by name.
   */
  @ApiProperty()
  @Column({ type: 'integer', nullable: false, default: 0 })
  public position: number;

  /**
   * isStatic.
   */
  @ApiProperty()
  @IsBoolean()
  @Column({ type: 'boolean', nullable: false, default: false })
  public isStatic: boolean;

  /**
   * when true it will create a copy of the child records modified properties on write to the
   * db_records_associations_columns table which are then merged with the existing child records properties on read.
   */
  @ApiProperty()
  @IsBoolean()
  @Column({ type: 'boolean', nullable: false, default: false })
  public hasColumnMappings: boolean;

  /**
   * Actions for the UI
   * LOOKUP_AND_CREATE
   * CREATE_ONLY
   * READ_ONLY
   */
  @ApiProperty()
  @IsString()
  @Column({ type: 'varchar', nullable: true, default: 'LOOKUP_AND_CREATE' })
  public parentActions: string;

  /**
   * Actions for the UI
   * LOOKUP_AND_CREATE
   * CREATE_ONLY
   * READ_ONLY
   */
  @ApiProperty()
  @IsString()
  @Column({ type: 'varchar', nullable: true, default: 'LOOKUP_AND_CREATE' })
  public childActions: string;

  /**
   * Cascade delete child record will delete the child db record when the parent is deleted.
   */
  @ApiProperty()
  @IsBoolean()
  @Column({ type: 'boolean', nullable: false, default: false })
  public cascadeDeleteChildRecord: boolean;
  /**
   * SchemaId can be a parent or child schema
   * findInSchema.
   */
  @ApiProperty()
  @IsString()
  @IsOptional()
  @Column({ type: 'varchar', nullable: true, default: null })
  public findInSchema?: string;

  /**
   * SchemaId can be a parent or child schema
   * findInChildSchema.
   */
  @ApiProperty()
  @IsString()
  @IsOptional()
  @Column({ type: 'varchar', nullable: true, default: null })
  public findInChildSchema?: string;

  /**
   * getUrl.
   */
  @ApiProperty()
  @IsString()
  @IsOptional()
  @Column({ type: 'varchar', nullable: true, default: null })
  public getUrl?: string;

  /**
   * postUrl.
   */
  @ApiProperty()
  @IsString()
  @IsOptional()
  @Column({ type: 'varchar', nullable: true, default: null })
  public postUrl?: string;

  /**
   * putUrl.
   */
  @ApiProperty()
  @IsString()
  @IsOptional()
  @Column({ type: 'varchar', nullable: true, default: null })
  public putUrl?: string;

  /**
   * deleteUrl.
   */
  @ApiProperty()
  @IsString()
  @IsOptional()
  @Column({ type: 'varchar', nullable: true, default: null })
  public deleteUrl?: string;


}
