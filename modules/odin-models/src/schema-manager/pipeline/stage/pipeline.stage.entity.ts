import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, Length } from 'class-validator';
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { Base } from '../../../Base';
import { OrganizationEntity } from '../../../identity/organization/organization.entity';
import { DbRecordEntity } from '../../db/record/db.record.entity';
import { PipelineEntity } from '../pipeline.entity';

@Entity({ name: 'pipelines_stages' })
@Index([ 'organization', 'name', 'pipeline', 'position' ], { unique: true })
@Index([ 'organization', 'key' ], { unique: true })
export class PipelineStageEntity extends Base {

  @ManyToOne(type => OrganizationEntity, { nullable: false })
  @JoinColumn({ name: 'organization_id', referencedColumnName: 'id' })
  public organization?: OrganizationEntity;

  @Column({ name: 'organization_id' })
  @RelationId((pipelineStage: PipelineStageEntity) => pipelineStage.organization) // you need to specify target
  public organizationId?: string;

  @ManyToOne(type => PipelineEntity, pipeline => pipeline.stages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pipeline_id', referencedColumnName: 'id' })
  public pipeline: PipelineEntity;

  @Column({ name: 'pipeline_id' })
  @RelationId((pipelineStage: PipelineStageEntity) => pipelineStage.pipeline)
  public pipelineId?: string;

  @OneToMany(type => DbRecordEntity, records => records.stage)
  public records?: DbRecordEntity;

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
  @Length(1, 255)
  @Column({ type: 'varchar', length: 255, nullable: false })
  public description: string;

  @ApiProperty()
  @Column({ type: 'integer', nullable: false })
  public position: number;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  @Column({ type: 'boolean', nullable: false, default: false })
  public isDefault?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  @Column({ type: 'boolean', nullable: false, default: false })
  public isSuccess?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  @Column({ type: 'boolean', nullable: false, default: false })
  public isFail?: boolean;

}

