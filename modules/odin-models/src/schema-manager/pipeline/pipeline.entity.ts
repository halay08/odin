import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, Length } from 'class-validator';
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { Base } from '../../Base';
import { OrganizationEntity } from '../../identity/organization/organization.entity';
import { SchemaModuleTypeEnums } from '../schema/types/schema.module.types';
import { PipelineStageEntity } from './stage/pipeline.stage.entity';

@Entity({ name: 'pipelines' })
@Index([ 'organization', 'moduleName', 'entityName' ], { unique: true })
@Index([ 'organization', 'key' ], { unique: true })
export class PipelineEntity extends Base {

  @ManyToOne(type => OrganizationEntity, { nullable: false })
  @JoinColumn({ name: 'organization_id', referencedColumnName: 'id' })
  public organization?: OrganizationEntity;

  @Column({ name: 'organization_id' })
  @RelationId((pipeline: PipelineEntity) => pipeline.organization) // you need to specify target
  public organizationId?: string;

  @OneToMany(type => PipelineStageEntity, stages => stages.pipeline, { cascade: true })
  public stages?: PipelineStageEntity[];

  @ApiProperty()
  @Length(3, 55)
  @Column({ type: 'varchar', length: 55, nullable: false })
  public name: string;

  @ApiProperty()
  @IsOptional()
  @Length(4, 255)
  @Column({ type: 'varchar', length: 255, nullable: false })
  public key: string;

  @ApiProperty()
  @Length(0, 255)
  @Column({ type: 'varchar', length: 255, nullable: false })
  public description: string;

  @IsEnum(SchemaModuleTypeEnums)
  @Column({ type: 'varchar', length: 55, nullable: false })
  public moduleName: SchemaModuleTypeEnums;

  @Length(2, 55)
  @Column({ type: 'varchar', length: 55, nullable: false })
  public entityName: string;

  /**
   * Deprecated
   */
  // @ApiProperty()
  // @IsOptional()
  // @IsBoolean()
  // @Column({ type: 'boolean', nullable: false, default: false })
  // public isDefault: boolean;


}

