import { Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne, RelationId } from 'typeorm';
import { Base } from '../../../../Base';
import { OrganizationEntity } from '../../../../identity/organization/organization.entity';
import { OrganizationUserEntity } from '../../../../identity/organization/user/organization.user.entity';
import { SchemaColumnEntity } from '../../../schema/column/schema.column.entity';
import { SchemaEntity } from '../../../schema/schema.entity';
import { SchemaTypeEntity } from '../../../schema/types/schema.type.entity';
import { DbRecordEntity } from '../db.record.entity';

@Entity({ name: 'db_records_columns' })
export class DbRecordColumnEntity extends Base {

  @ManyToOne(type => OrganizationEntity, { nullable: false })
  @JoinColumn({ name: 'organization_id', referencedColumnName: 'id' })
  public organization?: OrganizationEntity;

  @Column({ name: 'organization_id' })
  @RelationId((dbRecordColumn: DbRecordColumnEntity) => dbRecordColumn.organization) // you need to specify target
  public organizationId?: string;

  @ManyToOne(type => SchemaEntity, { nullable: false })
  @JoinColumn({ name: 'schema_id', referencedColumnName: 'id' })
  public schema?: SchemaEntity;

  @Column({ name: 'schema_id' })
  @RelationId((dbRecordColumn: DbRecordColumnEntity) => dbRecordColumn.schema) // you need to specify target relation
  public schemaId?: string;

  // ODN-1201
  @ManyToOne(type => SchemaTypeEntity, { nullable: true })
  @JoinColumn({ name: 'schema_type_id', referencedColumnName: 'id' })
  public schemaType?: SchemaTypeEntity;

  // ODN-1201
  @Column({ name: 'schema_type_id' })
  @RelationId((schemaColumn: DbRecordColumnEntity) => schemaColumn.schemaType) // you need to specify target
  public schemaTypeId?: string;

  // ODN-1201
  @Column({ name: 'type' })
  public type?: string;

  @ManyToOne(type => SchemaColumnEntity, { nullable: false })
  @JoinColumn({ name: 'column_id', referencedColumnName: 'id' })
  public column?: SchemaColumnEntity;

  @Column({ name: 'column_id' })
  @RelationId((dbRecordColumn: DbRecordColumnEntity) => dbRecordColumn.column) // you need to specify target relation
  public columnId?: string;

  @Column({ name: 'column_name' })
  public columnName?: string;

  @Column({ nullable: true, type: 'text' })
  public value: string;

  @ManyToOne(type => DbRecordEntity, record => record.columns, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'record_id', referencedColumnName: 'id' })
  public record?: DbRecordEntity;

  @Column({ name: 'record_id' })
  @RelationId((dbRecordColumn: DbRecordColumnEntity) => dbRecordColumn.record) // you need to specify target relation
  public recordId?: string;

  @ManyToOne(type => OrganizationUserEntity, user => user.recordColumnsModified)
  public lastModifiedBy?: OrganizationUserEntity;

  @DeleteDateColumn()
  public deletedAt?: Date;

}
