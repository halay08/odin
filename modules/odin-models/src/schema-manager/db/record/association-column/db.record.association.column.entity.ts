import { Column, DeleteDateColumn, Entity, Index, JoinColumn, ManyToOne, RelationId } from 'typeorm';
import { Base } from '../../../../Base';
import { OrganizationEntity } from '../../../../identity/organization/organization.entity';
import { OrganizationUserEntity } from '../../../../identity/organization/user/organization.user.entity';
import { SchemaColumnEntity } from '../../../schema/column/schema.column.entity';
import { SchemaEntity } from '../../../schema/schema.entity';
import { SchemaTypeEntity } from '../../../schema/types/schema.type.entity';
import { DbRecordAssociationEntity } from '../association/db.record.association.entity';

@Entity({ name: 'db_records_associations_columns' })
export class DbRecordAssociationColumnEntity extends Base {

  @ManyToOne(type => OrganizationEntity, { nullable: false })
  @Index()
  public organization: OrganizationEntity;

  @ManyToOne(type => SchemaEntity, { nullable: false })
  @JoinColumn({ name: 'schema_id', referencedColumnName: 'id' })
  public schema?: SchemaEntity;

  @Column({ name: 'schema_id' })
  @RelationId((dbRecordColumn: DbRecordAssociationColumnEntity) => dbRecordColumn.schema)
  public schemaId?: string;

  // ODN-1201
  @ManyToOne(type => SchemaTypeEntity, { nullable: true })
  @JoinColumn({ name: 'schema_type_id', referencedColumnName: 'id' })
  public schemaType?: SchemaTypeEntity;

  // ODN-1201
  @Column({ name: 'schema_type_id' })
  @RelationId((schemaColumn: DbRecordAssociationColumnEntity) => schemaColumn.schemaType)
  public schemaTypeId?: string;

  // ODN-1201
  @Column({ name: 'type' })
  public type?: string;

  @ManyToOne(type => SchemaColumnEntity, { nullable: false })
  @JoinColumn({ name: 'column_id', referencedColumnName: 'id' })
  public column: SchemaColumnEntity;

  @Column({ name: 'column_id' })
  @RelationId((dbRecordColumn: DbRecordAssociationColumnEntity) => dbRecordColumn.column)
  public columnId?: string;

  @ManyToOne(
    type => DbRecordAssociationEntity,
    association => association.columns,
    { onDelete: 'CASCADE', nullable: false },
  )
  @JoinColumn({ name: 'db_record_association_id', referencedColumnName: 'id' })
  public dbRecordAssociation: DbRecordAssociationEntity;

  @Column({ name: 'db_record_association_id' })
  @RelationId((dbRecordColumn: DbRecordAssociationColumnEntity) => dbRecordColumn.dbRecordAssociation)
  public dbRecordAssociationId?: string;

  @Column({ nullable: true, type: 'text' })
  public value: string;

  @Column({ nullable: true, type: 'text' })
  public recordId?: string;

  @Column({ name: 'column_name' })
  public columnName?: string;

  @ManyToOne(type => OrganizationUserEntity, user => user.recordColumnsModified)
  public lastModifiedBy?: OrganizationUserEntity;

  @DeleteDateColumn()
  public deletedAt?: Date;

}
