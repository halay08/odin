import { Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { Base } from '../../../../Base';
import { OrganizationEntity } from '../../../../identity/organization/organization.entity';
import { OrganizationUserEntity } from '../../../../identity/organization/user/organization.user.entity';
import { SchemaAssociationEntity } from '../../../schema/association/schema.association.entity';
import { SchemaEntity } from '../../../schema/schema.entity';
import { DbRecordAssociationColumnEntity } from '../association-column/db.record.association.column.entity';
import { DbRecordColumnEntity } from '../column/db.record.column.entity';
import { DbRecordEntity } from '../db.record.entity';

@Entity({ name: 'db_records_associations' })
export class DbRecordAssociationEntity extends Base {


  @ManyToOne(type => OrganizationEntity, { nullable: false })
  @JoinColumn({ name: 'organization_id', referencedColumnName: 'id' })
  public organization?: OrganizationEntity;

  @Column({ name: 'organization_id' })
  @RelationId((dbRecordColumn: DbRecordColumnEntity) => dbRecordColumn.organization)
  public organizationId?: string;

  @ManyToOne(type => SchemaAssociationEntity, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'schema_association_id', referencedColumnName: 'id' })
  public schemaAssociation?: SchemaAssociationEntity;

  @Column({ name: 'schema_association_id' })
  @RelationId((dbRecordAssociation: DbRecordAssociationEntity) => dbRecordAssociation.schemaAssociation)
  public schemaAssociationId?: string;


  @Column({ name: 'parent_entity' })
  public parentEntity?: string;

  @Column({ name: 'child_entity' })
  public childEntity?: string;

  @ManyToOne(type => SchemaEntity, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'parent_schema_id', referencedColumnName: 'id' })
  public parentSchema?: SchemaEntity;

  // you need to specify target relation
  @Column({ name: 'parent_schema_id' })
  @RelationId((dbRecordAssociation: DbRecordAssociationEntity) => dbRecordAssociation.parentSchema)
  public parentSchemaId?: string;

  @ManyToOne(type => DbRecordEntity, parentRecord => parentRecord.parentRelations, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'parent_record_id', referencedColumnName: 'id' })
  public parentRecord?: DbRecordEntity;

  // you need to specify target relation
  @Column({ name: 'parent_record_id' })
  @RelationId((dbRecordAssociation: DbRecordAssociationEntity) => dbRecordAssociation.parentRecord)
  public parentRecordId?: string;

  @ManyToOne(type => SchemaEntity, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'child_schema_id', referencedColumnName: 'id' })
  public childSchema?: SchemaEntity;

  // you need to specify target relation
  @Column({ name: 'child_schema_id' })
  @RelationId((dbRecordAssociation: DbRecordAssociationEntity) => dbRecordAssociation.childSchema)
  public childSchemaId?: string;

  @ManyToOne(type => DbRecordEntity, childRecord => childRecord.childRelations, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'child_record_id', referencedColumnName: 'id' })
  public childRecord?: DbRecordEntity;

  // you need to specify target relation
  @Column({ name: 'child_record_id' })
  @RelationId((dbRecordAssociation: DbRecordAssociationEntity) => dbRecordAssociation.childRecord)
  public childRecordId?: string;

  /**
   * This column is used for instances where the (parent or child record of this association)
   * has an association that has possibly modified one or more columns.
   *
   * Example:
   *
   * PriceBook__Product
   * - The price book can modify properties of the product creating  a new version of that product, specific to the
   *   association with the PriceBook.
   * Order__Product
   * - The Order wants to use a product from a specific PriceBook
   * - We need to know the price book "relatedAssociation" for the product in the Order__Product association
   * - Then we can merge the db_records_association_columns for the relatedAssociation + Product which is a unique
   *   version of the record.
   */
  @ManyToOne(
    type => DbRecordAssociationEntity,
    association => association.columns,
    { onDelete: 'CASCADE', nullable: true },
  )
  @JoinColumn({ name: 'related_association_id', referencedColumnName: 'id' })
  public relatedAssociation?: DbRecordAssociationEntity;

  // you need to specify target relation
  @Column({ name: 'related_association_id' })
  @RelationId((dbRecordAssociation: DbRecordAssociationEntity) => dbRecordAssociation.relatedAssociation)
  public relatedAssociationId?: string;

  @OneToMany(type => DbRecordAssociationColumnEntity, columns => columns.dbRecordAssociation)
  public columns?: DbRecordAssociationColumnEntity[];

  @ManyToOne(type => OrganizationUserEntity, user => user.recordAssociationsCreated)
  public createdBy?: OrganizationUserEntity;

  @ManyToOne(type => OrganizationUserEntity, user => user.recordAssociationsModified)
  public lastModifiedBy?: OrganizationUserEntity;

  @DeleteDateColumn()
  public deletedAt?: Date;

}
