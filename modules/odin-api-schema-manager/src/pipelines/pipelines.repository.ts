import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationEntity } from '@d19n/models/dist/identity/organization/organization.entity';
import { PipelineEntity } from '@d19n/models/dist/schema-manager/pipeline/pipeline.entity';
import { EntityRepository, Repository } from 'typeorm';
import { getEntityColumns } from '../common/TypeormHelpers';

@EntityRepository(PipelineEntity)
export class PipelineEntitysRepository extends Repository<PipelineEntity> {

  /**
   *
   * @param organization
   * @param moduleName
   * @param entityName
   */
  public async getByModuleAndEntity(
    organization: OrganizationEntity,
    moduleName: string,
    entityName: string,
  ): Promise<PipelineEntity> {
    try {

      const res = await this.query(`
      SELECT ${getEntityColumns(PipelineEntity)} 
      FROM pipelines 
      WHERE organization_id = '${organization.id}' 
      AND module_name = '${moduleName}'
      AND entity_name = '${entityName}' 
      `);

      let pipeline: PipelineEntity = undefined;

      if(res[0]) {

        pipeline = new PipelineEntity();
        pipeline.id = res[0].id;
        pipeline.name = res[0].name;
        pipeline.description = res[0].description;
        pipeline.moduleName = res[0].module_name;
        pipeline.entityName = res[0].entity_name;

      }

      return pipeline;
    } catch (e) {
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }

  /**
   *
   * @param organization
   * @param moduleName
   * @param entityName
   */
  public async getById(
    organization: OrganizationEntity,
    pipelineId: string,
  ): Promise<PipelineEntity> {
    try {

      const res = await this.query(`
      SELECT ${getEntityColumns(PipelineEntity)} 
      FROM pipelines 
      WHERE organization_id = '${organization.id}' 
      AND id = '${pipelineId}'
      `);

      let pipeline: PipelineEntity = undefined;

      if(res[0]) {

        pipeline = new PipelineEntity();
        pipeline.id = res[0].id;
        pipeline.name = res[0].name;
        pipeline.description = res[0].description;
        pipeline.moduleName = res[0].module_name;
        pipeline.entityName = res[0].entity_name;

      }

      if(!pipeline) {
        throw new ExceptionType(404, `pipeline not found with id ${pipelineId}`);
      }

      return pipeline;

    } catch (e) {
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }


}
