import { Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, RelationId, ManyToMany, JoinTable, Index } from 'typeorm';
import { Base } from '../../../Base';
import { OrganizationAppEntity } from '../../../identity/organization/app/organization.app.entity';
import { OrganizationEntity } from '../../../identity/organization/organization.entity';
import { OrganizationUserGroupEntity } from '../../../identity/organization/user/group/organization.user.group.entity';
import { OrganizationUserEntity } from '../../../identity/organization/user/organization.user.entity';
import { PipelineStageEntity } from '../../pipeline/stage/pipeline.stage.entity';
import { SchemaEntity } from '../../schema/schema.entity';
import { SchemaTypeEntity } from '../../schema/types/schema.type.entity';
import { DbRecordAssociationEntity } from './association/db.record.association.entity';
import { DbRecordColumnEntity } from './column/db.record.column.entity';


@Index("idx_dbr_created_by_id", ["createdById"], {})
@Index(
  "idx_dbr_org_sid_title_del",
  ["deletedAt", "organizationId", "schemaId", "title"],
  {}
)
@Index("idx_dbr_org_id_del", ["deletedAt", "id", "organizationId"], {})
@Index("idx_dbr_del", ["deletedAt"], {})
@Index("idx_dbr_last_modified_by_id", ["lastModifiedById"], {})
@Index("idx_dbr_owned_by_id", ["ownedById"], {})
@Index("idx_dbr_sid", ["schemaId"], {})
@Index("idx_dbr_sctid", ["schemaTypeId"], {})
@Entity({ name: 'db_records' })
export class DbRecordEntity extends Base {

  @ManyToMany(type => OrganizationUserGroupEntity, groups => groups.users, { eager: true })
  @JoinTable({ name: 'db_records_groups',
  joinColumn: {
    name: "record_id",
  },
  inverseJoinColumn: {
      name: "group_id",
  } })
  public groups: OrganizationUserGroupEntity[];

  @ManyToOne(type => OrganizationEntity, { nullable: false })
  @JoinColumn({ name: 'organization_id', referencedColumnName: 'id' })
  public organization?: OrganizationEntity;

  @Column({ name: 'organization_id' })
  @RelationId((dbRecord: DbRecordEntity) => dbRecord.organization) // you need to specify target
  public organizationId?: string;

  @ManyToOne(type => SchemaEntity, { nullable: false })
  @JoinColumn({ name: 'schema_id', referencedColumnName: 'id' })
  public schema?: SchemaEntity;

  @Column({ name: 'schema_id' })
  @RelationId((dbRecord: DbRecordEntity) => dbRecord.schema) // you need to specify target relation
  public schemaId?: string;

  @Column({ name: 'entity' })
  public entity?: string;

  // ODN-1201
  @ManyToOne(type => SchemaTypeEntity, { nullable: true })
  @JoinColumn({ name: 'schema_type_id', referencedColumnName: 'id' })
  public schemaType?: SchemaTypeEntity;

  // ODN-1201
  @Column({ name: 'schema_type_id' })
  @RelationId((dbRecord: DbRecordEntity) => dbRecord.schemaType) // you need to specify target
  public schemaTypeId?: string;

  // ODN-1201
  @Column({ name: 'type' })
  public type?: string;

  @OneToMany(type => DbRecordColumnEntity, columns => columns.record, { cascade: true })
  public columns?: DbRecordColumnEntity[];

  @ManyToOne(type => PipelineStageEntity, stage => stage.records, { nullable: true })
  @JoinColumn({ name: 'stage_id', referencedColumnName: 'id' })
  public stage?: PipelineStageEntity;

  @Column({ name: 'stage_id' })
  @RelationId((dbRecord: DbRecordEntity) => dbRecord.stage)
  public stageId?: string;

  @OneToMany(type => DbRecordAssociationEntity, parentRelations => parentRelations.parentRecord)
  public parentRelations?: DbRecordAssociationEntity[];

  @OneToMany(type => DbRecordAssociationEntity, childRelations => childRelations.childRecord)
  public childRelations?: DbRecordAssociationEntity[];

  /**
   * External app for the record when externalId is not null
   */
  @ManyToOne(type => OrganizationAppEntity, { nullable: true })
  public externalApp?: OrganizationAppEntity;

  @Column({ name: 'external_app_id' })
  @RelationId((dbRecord: DbRecordEntity) => dbRecord.externalApp) // you need to specify target relation
  public externalAppId?: string;

  /**
   * ExternalId from another system
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  public externalId?: string;

  /**
   * the conditions for the title property are handled in the schema definition.
   * hasTitle: boolean - if the record has a title it will be treated as a unique identifier
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  public title?: string;
  /**
   * auto-generated record number from the schema definition
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  public recordNumber?: string;

  /**
   * User that created this record
   */
  @ManyToOne(type => OrganizationUserEntity, user => user.recordsCreated)
  public createdBy?: OrganizationUserEntity;

  /**
   * User that last modified this record
   */
  @ManyToOne(type => OrganizationUserEntity, user => user.recordsModified)
  public lastModifiedBy?: OrganizationUserEntity;

  /**
   * User that last modified this record
   */
  @ManyToOne(type => OrganizationUserEntity, user => user.recordsOwned)
  public ownedBy?: OrganizationUserEntity;

  @Column({ type: 'date', nullable: true })
  public stageUpdatedAt?: Date;

  @DeleteDateColumn()
  public deletedAt?: Date;

  @Column("uuid", { name: "created_by_id", nullable: true })
  createdById: string | null;

  @Column("uuid", { name: "last_modified_by_id", nullable: true })
  lastModifiedById: string | null;

  @Column("uuid", { name: "owned_by_id", nullable: true })
  ownedById: string | null;

}
