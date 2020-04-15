import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, Length } from 'class-validator';
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { Base } from '../../../Base';
import { OrganizationEntity } from '../../../identity/organization/organization.entity';
import { SchemaColumnEntity } from '../column/schema.column.entity';
import { SchemaEntity } from '../schema.entity';

@Entity({ name: 'schemas_types' })
@Index([ 'organization', 'schema', 'name' ], { unique: true })
export class SchemaTypeEntity extends Base {

  //
  // Relationships
  //
  @ManyToOne(type => OrganizationEntity, { onDelete: 'CASCADE' })
  public organization: OrganizationEntity;

  @OneToMany(schemaColumn => SchemaColumnEntity, schemaColumn => schemaColumn.schemaType)
  public schemaColumn: SchemaColumnEntity;

  @ManyToOne(type => SchemaEntity, schema => schema.columns, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'schema_id', referencedColumnName: 'id' })
  public schema: SchemaEntity;

  @Column({ name: 'schema_id' })
  @RelationId((schemaType: SchemaTypeEntity) => schemaType.schema) // you need to specify target
  public schemaId?: string;

  //
  // Properties
  //
  @ApiProperty()
  @Length(0, 55)
  @Column({ type: 'varchar', length: 55, nullable: false })
  public name: string;

  @ApiProperty()
  @Length(0, 55)
  @Column({ type: 'varchar', length: 55, nullable: true })
  public label: string;

  @ApiProperty()
  @Length(0, 55)
  @Column({ type: 'varchar', length: 255, nullable: true })
  public description: string;

  @ApiProperty()
  @IsBoolean()
  @Column({ type: 'boolean', nullable: false, default: false })
  public isDefault: boolean;

}
