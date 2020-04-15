import { PipelineStageEntity } from '@d19n/models/dist/schema-manager/pipeline/stage/pipeline.stage.entity';

export const renderDisabledFields = (elem: PipelineStageEntity) => {

  let disabledFields: string[] = [];
  if(elem.key !== 'ExampleStageKey') {
    disabledFields = [
      ...disabledFields, ...[
        'SurveyDate',
      ],
    ];
  }

  return disabledFields;

};
