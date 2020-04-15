import { ApiProperty } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';
import { Exclude, Expose } from 'class-transformer';
import { Length } from 'class-validator';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Base } from '../../../Base';
import { DbRecordAssociationEntity } from '../../../schema-manager/db/record/association/db.record.association.entity';
import { DbRecordColumnEntity } from '../../../schema-manager/db/record/column/db.record.column.entity';
import { DbRecordEntity } from '../../../schema-manager/db/record/db.record.entity';
import { OrganizationEntity } from '../organization.entity';
import { OrganizationUserGroupEntity } from './group/organization.user.group.entity';
import { OrganizationUserStatus } from './organization.user.status';
import { OrganizationUserRbacRoleEntity } from './rbac/role/organization.user.rbac.role.entity';

@Entity({ name: 'organizations_users' })
@Index([ 'organization', 'email' ], { unique: true })
export class OrganizationUserEntity extends Base {

  //
  // Relationships
  //
  @ManyToOne(type => OrganizationEntity, { onDelete: 'CASCADE', eager: true })
  public organization?: OrganizationEntity;

  @ManyToMany(type => OrganizationUserRbacRoleEntity, role => role.users, { eager: true })
  @JoinTable({ name: 'organizations_users_roles_assignments' })
  public roles: OrganizationUserRbacRoleEntity[];

  @ManyToMany(type => OrganizationUserGroupEntity, group => group.users, { eager: true })
  @JoinTable({ name: 'organizations_users_groups_assignments' })
  public groups: OrganizationUserGroupEntity[];

  @OneToMany(type => DbRecordEntity, dbRecord => dbRecord.createdBy)
  public recordsCreated?: DbRecordEntity[];

  @OneToMany(type => DbRecordEntity, dbRecord => dbRecord.lastModifiedBy)
  public recordsModified?: DbRecordEntity[];

  @OneToMany(type => DbRecordEntity, dbRecord => dbRecord.ownedBy)
  public recordsOwned?: DbRecordEntity[];

  @OneToMany(type => DbRecordAssociationEntity, dbRecordAssociation => dbRecordAssociation.createdBy)
  public recordAssociationsCreated?: DbRecordAssociationEntity[];

  @OneToMany(type => DbRecordAssociationEntity, dbRecordAssociation => dbRecordAssociation.lastModifiedBy)
  public recordAssociationsModified?: DbRecordAssociationEntity[];

  @OneToMany(type => DbRecordColumnEntity, dbRecordColumn => dbRecordColumn.lastModifiedBy)
  public recordColumnsModified?: DbRecordColumnEntity[];

  //
  // Properties
  //
  @ApiProperty()
  @Column({
    type: 'enum',
    enum: OrganizationUserStatus,
    default: OrganizationUserStatus.PENDING_CONFIRMATION,
  })
  public status?: OrganizationUserStatus;

  @ApiProperty()
  @Length(1, 50)
  @Column({ type: 'varchar', length: 50, nullable: false })
  public firstname?: string;

  @ApiProperty()
  @Length(1, 50)
  @Column({ type: 'varchar', length: 50, nullable: false })
  public lastname?: string;

  @ApiProperty()
  @Length(1, 175)
  @Column({ type: 'varchar', length: 175, nullable: false })
  public email?: string;

  @ApiProperty()
  @Column({ type: 'boolean', nullable: false, default: false })
  public emailVerified?: boolean = false;

  @BeforeInsert()
  @BeforeUpdate()
  public async hashPassword() {
    if(this.password && !this.password.match(/\$2b\$10\$/)) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  @ApiProperty()
  @Column({ type: 'varchar', length: 100, nullable: false })
  @Exclude()
  public password?: string;

  @ApiProperty()
  @Length(1, 32)
  @Column({ type: 'varchar', length: 32, nullable: true })
  public timezoneName?: string;

  @ApiProperty()
  @Length(1, 32)
  @Column({ type: 'varchar', length: 32, nullable: true })
  public timezoneOffset?: string;

  @ApiProperty()
  @Length(1, 32)
  @Column({ type: 'varchar', length: 32, nullable: true })
  public locale?: string;

  @ApiProperty()
  @Column({ type: 'boolean', nullable: false, default: false })
  public isBetaTester?: boolean = false;

  public sanitize(): OrganizationUserEntity {
    delete this.password;
    return this;
  }

  @Expose()
  get fullName(): string {
    return `${this.firstname} ${this.lastname}`;
  }

  // meta data when the user is making http requests
  public headers?: any;
  public permissions?: [];

}
