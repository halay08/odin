import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { LogsConstants } from '@d19n/models/dist/logs/logs.constants';
import {
    SUB_DB_RECORD_ASSOCIATION_CREATED,
    SUB_DB_RECORD_ASSOCIATION_DELETED,
    SUB_DB_RECORD_ASSOCIATION_UPDATED,
    SUB_DB_RECORD_DELETED,
    SUB_DB_RECORD_UPDATED,
} from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import {
    IDbRecordAssociationCreated,
    IDbRecordAssociationDeleted,
    IDbRecordUpdated,
} from '@d19n/models/dist/rabbitmq/rabbitmq.interfaces';
import { splitEntityToModuleAndEntity } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { TasksService } from './tasks.service';

const FEATURE = 'Feature';
const { TASK, SUBTASK, PRODUCT } = SchemaModuleEntityTypeEnums;

@Injectable()
export class TasksRabbitmqHandler {

    constructor(private readonly tasksService: TasksService) {

        this.tasksService = tasksService;
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
        routingKey: `${process.env.MODULE_NAME}.${SUBTASK}.${SUB_DB_RECORD_UPDATED}`,
        queue: `${process.env.MODULE_NAME}.${TASK}.${SUBTASK}.${SUB_DB_RECORD_UPDATED}`,
    })
    private async handleSubTaskUpdatedEvent(msg: IDbRecordUpdated) {

        // Handle message
        if(msg.event === LogsConstants.DB_RECORD_STAGE_UPDATED) {
            await this.tasksService.handleTaskSubtaskStageUpdated(msg.principal, msg.id, msg.body);
        }
        if(msg.event === LogsConstants.DB_RECORD_UPDATED) {
            await this.tasksService.handleTaskSubtaskUpdated(msg.principal, msg.id, msg.body);
        }
    }

    /**
     *  Handle tasks deleted
     * @param msg
     * @private
     */
    @RabbitSubscribe({
        exchange: process.env.MODULE_NAME,
        routingKey: `${process.env.MODULE_NAME}.${SUBTASK}.${SUB_DB_RECORD_DELETED}`,
        queue: `${process.env.MODULE_NAME}.${TASK}.${SUBTASK}.${SUB_DB_RECORD_DELETED}`,
    })
    private async handleSubTaskDeletedEvent(msg: IDbRecordUpdated) {

        // Handle message
        if(msg.event === LogsConstants.DB_RECORD_DELETED) {
            await this.tasksService.handleTaskSubtaskDeleted(msg.principal, msg.id, msg.body);
        }
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
        routingKey: `${process.env.MODULE_NAME}.${FEATURE}.${SUB_DB_RECORD_UPDATED}`,
        queue: `${process.env.MODULE_NAME}.${TASK}.${FEATURE}.${SUB_DB_RECORD_UPDATED}`,
    })
    private async handleFeatureUpdatedEvent(msg: IDbRecordUpdated) {

        if(msg.event === LogsConstants.DB_RECORD_UPDATED) {
            console.log('feature updated', msg);
            await this.tasksService.handleTaskFeatureUpdated(msg.principal, msg.id, msg.body);
        }
    }

    /**
     *  Handle tasks deleted
     * @param msg
     * @private
     */
    @RabbitSubscribe({
        exchange: process.env.MODULE_NAME,
        routingKey: `${process.env.MODULE_NAME}.${FEATURE}.${SUB_DB_RECORD_DELETED}`,
        queue: `${process.env.MODULE_NAME}.${TASK}.${FEATURE}.${SUB_DB_RECORD_DELETED}`,
    })
    private async handleFeatureDeletedEvent(msg: IDbRecordUpdated) {

        // Handle message
        if(msg.event === LogsConstants.DB_RECORD_DELETED) {
            console.log('feature deleted', msg);
            await this.tasksService.handleTaskFeatureDeleted(msg.principal, msg.id, msg.body);
        }
    }


    /**
     *
     * @param msg
     * @private
     */
    @RabbitSubscribe({
        exchange: process.env.MODULE_NAME,
        routingKey: `${process.env.MODULE_NAME}.${SUB_DB_RECORD_ASSOCIATION_CREATED}`,
        queue: `${process.env.MODULE_NAME}.${TASK}.${SUB_DB_RECORD_ASSOCIATION_CREATED}`,
    })
    private async handleDbRecordAssociationCreated(msg: IDbRecordAssociationCreated) {

        if(msg.dbRecordAssociation) {

            // Handle message
            const splitParent = splitEntityToModuleAndEntity(msg.dbRecordAssociation.parentEntity);
            const splitChild = splitEntityToModuleAndEntity(msg.dbRecordAssociation.childEntity);

            if(splitParent.entityName === TASK && splitChild.entityName === PRODUCT) {

                const { parentRecordId } = msg.dbRecordAssociation;

                await this.tasksService.computeTaskProductTotalsAndSave(msg.principal, parentRecordId);
            }

        }

    }

    /**
     *
     * @param msg
     * @private
     */
    @RabbitSubscribe({
        exchange: process.env.MODULE_NAME,
        routingKey: `${process.env.MODULE_NAME}.${SUB_DB_RECORD_ASSOCIATION_UPDATED}`,
        queue: `${process.env.MODULE_NAME}.${TASK}.${SUB_DB_RECORD_ASSOCIATION_UPDATED}`,
    })
    private async handleDbRecordAssociationUpdated(msg: IDbRecordAssociationDeleted) {
        try {
            if(msg.dbRecordAssociation) {
                // Handle message
                const splitParent = splitEntityToModuleAndEntity(msg.dbRecordAssociation.parentEntity);
                const splitChild = splitEntityToModuleAndEntity(msg.dbRecordAssociation.childEntity);

                if(splitParent.entityName === TASK && splitChild.entityName === PRODUCT) {

                    const { parentRecordId } = msg.dbRecordAssociation;

                    await this.tasksService.computeTaskProductTotalsAndSave(msg.principal, parentRecordId);
                }
            }
        } catch (e) {
            console.error(e);
            throw new ExceptionType(500, e.message);
        }
    }

    /**
     *
     * @param msg
     * @private
     */
    @RabbitSubscribe({
        exchange: process.env.MODULE_NAME,
        routingKey: `${process.env.MODULE_NAME}.${SUB_DB_RECORD_ASSOCIATION_DELETED}`,
        queue: `${process.env.MODULE_NAME}.${TASK}.${SUB_DB_RECORD_ASSOCIATION_DELETED}`,
    })
    private async handleDbRecordAssociationDeleted(msg: IDbRecordAssociationDeleted) {
        console.log('handleDbRecordAssociationDeleted message received', msg);
        try {
            if(msg.dbRecordAssociation) {
                // Handle message
                const splitParent = splitEntityToModuleAndEntity(msg.dbRecordAssociation.parentEntity);
                const splitChild = splitEntityToModuleAndEntity(msg.dbRecordAssociation.childEntity);

                if(splitParent.entityName === TASK && splitChild.entityName === PRODUCT) {

                    const { parentRecordId } = msg.dbRecordAssociation;

                    await this.tasksService.computeTaskProductTotalsAndSave(msg.principal, parentRecordId);
                }
            }
            if(msg.dbRecordAssociation) {
                // Handle message
                const splitParent = splitEntityToModuleAndEntity(msg.dbRecordAssociation.parentEntity);
                const splitChild = splitEntityToModuleAndEntity(msg.dbRecordAssociation.childEntity);

                if(splitParent.entityName === TASK && splitChild.entityName === SUBTASK) {

                    const { parentRecordId } = msg.dbRecordAssociation;

                    await this.tasksService.computeTaskProductTotalsAndSave(msg.principal, parentRecordId);
                }
            }
        } catch (e) {
            console.error(e);
            throw new ExceptionType(500, e.message);
        }
    }

}
