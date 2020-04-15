import { PipelineEntity } from '@d19n/models/dist/schema-manager/pipeline/pipeline.entity';

/**
 *
 * @param shortList
 * @param moduleName
 * @param entityName
 */
export const getPipelineFromShortListByModuleAndEntity = (
  shortList: { [key: string]: PipelineEntity },
  moduleName: string | undefined,
  entityName: string | undefined,
): PipelineEntity | undefined => {

  const keys = Object.keys(shortList);

  for(const key of keys) {

    const pipeline = shortList[key];

    if(pipeline.moduleName === moduleName && pipeline.entityName === entityName) {

      return pipeline;

    }

  }

};

export const getPipelineFromShortListBySchemaId = (
  shortList: { [key: string]: PipelineEntity },
  pipelineId: string | null | undefined,
): PipelineEntity | undefined => {

  return pipelineId ? shortList[pipelineId] : undefined;

};


