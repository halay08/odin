import { LogsConstants } from '@d19n/models/dist/logs/logs.constants';
import { SUB_DB_RECORD_DELETED, SUB_DB_RECORD_UPDATED } from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import { IDbRecordUpdated } from '@d19n/models/dist/rabbitmq/rabbitmq.interfaces';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { MilestonesService } from './milestones.service';

const { TASK, MILESTONE } = SchemaModuleEntityTypeEnums;

@Injectable()
export class MilestonesRabbitmqHandler {

  constructor(private readonly milestonesService: MilestonesService) {

    this.milestonesService = milestonesService;
  }

  /**
   *  Handle project updates
   *  Stage changes
   *  Record updates
   * @param msg
   * @private
   */
  @RabbitSubscribe({
    exchange: process.env.MODULE_NAME,
    routingKey: `${process.env.MODULE_NAME}.${TASK}.${SUB_DB_RECORD_UPDATED}`,
    queue: `${process.env.MODULE_NAME}.${MILESTONE}.${TASK}.${SUB_DB_RECORD_UPDATED}`,

  })
  private async handleProjectUpdatedEvent(msg: IDbRecordUpdated) {

    // Handle message
    if(msg.event === LogsConstants.DB_RECORD_STAGE_UPDATED) {
      await this.milestonesService.handleMilestoneTaskStageUpdated(msg.principal, msg.id, msg.body);
    }
    if(msg.event === LogsConstants.DB_RECORD_UPDATED) {
      await this.milestonesService.handleMilestoneTaskUpdated(msg.principal, msg.id, msg.body);
    }
  }

  /**
   *  Handle projects deleted
   * @param msg
   * @private
   */
  @RabbitSubscribe({
    exchange: process.env.MODULE_NAME,
    routingKey: `${process.env.MODULE_NAME}.${TASK}.${SUB_DB_RECORD_DELETED}`,
    queue: `${process.env.MODULE_NAME}.${MILESTONE}.${TASK}.${SUB_DB_RECORD_DELETED}`,

  })
  private async handleProjectDeletedEvent(msg: IDbRecordUpdated) {

    // Handle message
    if(msg.event === LogsConstants.DB_RECORD_CREATED) {
      await this.milestonesService.handleMilestoneTaskDeleted(msg.principal, msg.id, msg.body);
    }
  }

  private static handleError(e) {
    console.error('order event handler error', e);
  }
}
