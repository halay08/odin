import { PipelineStageEntity } from '@d19n/models/dist/schema-manager/pipeline/stage/pipeline.stage.entity';

export const renderVisibleFormFields = (elem: PipelineStageEntity) => {

  if(elem.key === 'OrderStageCancelled') {
    return [
      'CancellationReason',
      'CancellationReasonNote',
    ]
  } else if(elem.key === 'OrderStageActive') {
    return [
      'BillingStartDate',
    ]
  } else {
    return [ 'DISABLE_ALL_FIELDS' ];
  }
};
