import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';
import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { Base } from '../../../Base';
import { DbRecordEntity } from '../../../schema-manager/db/record/db.record.entity';
import { OrganizationEntity } from '../organization.entity';

@Entity({ name: 'organizations_apps' })
@Index([ 'organization', 'name' ], { unique: true })
export class OrganizationAppEntity extends Base {

  //
  // Relationships
  //
  @ManyToOne(type => OrganizationEntity, { onDelete: 'CASCADE' })
  public organization?: OrganizationEntity;

  @OneToMany(type => DbRecordEntity, records => records.externalApp)
  public records?: DbRecordEntity;

  //
  // Properties
  //
  @ApiProperty()
  // @Column({ type: 'enum', enum: OrganizationAppTypes, nullable: false })
  // public name: OrganizationAppTypes;
  @Length(1, 55)
  @Column({ type: 'varchar', length: 55, nullable: false })
  public name: string;

  @ApiProperty()
  @Length(1, 200)
  @Column({ type: 'varchar', length: 200, nullable: false })
  public baseUrl: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 500, nullable: false })
  public apiKey: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 200, nullable: true })
  public refreshToken: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 200, nullable: true })
  public healthCheckUrl: string;

}
