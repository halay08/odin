import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationEntity } from '@d19n/models/dist/identity/organization/organization.entity';
import { PipelineStageEntity } from '@d19n/models/dist/schema-manager/pipeline/stage/pipeline.stage.entity';
import { EntityRepository, Repository } from 'typeorm';
import { getEntityColumns } from '../../common/TypeormHelpers';

@EntityRepository(PipelineStageEntity)
export class PipelineEntitysStagesRepository extends Repository<PipelineStageEntity> {


  /**
   *
   * @param organization
   * @param moduleName
   * @param entityName
   */
  public async getPipelineStageByPipelineId(
    organization: OrganizationEntity,
    pipelineId: string,
  ): Promise<PipelineStageEntity[]> {
    try {

      const res = await this.query(`
      SELECT ${getEntityColumns(PipelineStageEntity)} 
      FROM pipelines_stages
      WHERE organization_id = '${organization.id}' 
      AND pipeline_id = '${pipelineId}'
      ORDER BY position;
      `);

      let stages: PipelineStageEntity[] = [];

      if(res[0]) {
        for(const item of res) {

          const stage = new PipelineStageEntity();
          stage.id = item.id;
          stage.name = item.name;
          stage.key = item.key;
          stage.position = item.position;
          stage.isSuccess = item.is_success;
          stage.isFail = item.is_fail;
          stage.isDefault = item.is_default;

          stages.push(stage);

        }
      }

      if(!stages) {
        throw new ExceptionType(404, `stages not found with pipeline id ${pipelineId}`);
      }

      return stages;

    } catch (e) {
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }


  /**
   *
   * @param organization
   * @param stageKey
   * @param relations
   */
  public async getPipelineStageByOrganizationAndKey(
    organization: OrganizationEntity,
    stageKey: string,
  ): Promise<PipelineStageEntity> {
    try {

      const res = await this.query(`
      SELECT ${getEntityColumns(PipelineStageEntity)} 
      FROM pipelines_stages 
      WHERE organization_id = '${organization.id}' 
      AND key = '${stageKey}';
      `);

      let stage: PipelineStageEntity = undefined;

      if(res[0]) {

        stage = new PipelineStageEntity();
        stage.id = res[0].id;
        stage.name = res[0].name;
        stage.key = res[0].key;
        stage.position = res[0].position;
        stage.isSuccess = res[0].is_success;
        stage.isFail = res[0].is_fail;
        stage.isDefault = res[0].is_default;

      }

      if(!stage) {
        throw new ExceptionType(404, `stage not found with key ${stageKey}`);
      }

      return stage;

    } catch (e) {
      throw new ExceptionType(500, e.message);
    }
  }


  /**
   *
   * @param organization
   * @param stageKey
   * @param relations
   */
  public async getPipelineStageByOrganizationAndId(
    organization: OrganizationEntity,
    stageId: string,
  ): Promise<PipelineStageEntity> {
    try {

      const res = await this.query(`
      SELECT ${getEntityColumns(PipelineStageEntity)} 
      FROM pipelines_stages 
      WHERE organization_id = '${organization.id}' 
      AND id = '${stageId}';
      `);

      let stage: PipelineStageEntity = undefined;

      if(res[0]) {

        stage = new PipelineStageEntity();
        stage.id = res[0].id;
        stage.pipelineId = res[0].pipeline_id;
        stage.name = res[0].name;
        stage.key = res[0].key;
        stage.position = res[0].position;
        stage.isSuccess = res[0].is_success;
        stage.isFail = res[0].is_fail;
        stage.isDefault = res[0].is_default;

      }

      if(!stage) {
        throw new ExceptionType(404, `stage not found with id ${stageId}`);
      }

      return stage;

    } catch (e) {
      throw new ExceptionType(500, e.message);
    }
  }


}
