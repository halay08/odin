import { LogsConstants } from '@d19n/models/dist/logs/logs.constants';
import {
    SUB_DB_RECORD_CREATED,
    SUB_DB_RECORD_DELETED,
    SUB_DB_RECORD_UPDATED,
} from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import { IDbRecordUpdated } from '@d19n/models/dist/rabbitmq/rabbitmq.interfaces';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { ProjectsService } from './projects.service';

const { MILESTONE, PROJECT } = SchemaModuleEntityTypeEnums;

@Injectable()
export class ProjectsRabbitmqHandler {

    constructor(private readonly projectsService: ProjectsService) {

        this.projectsService = projectsService;
    }

    /**
     *  Handle projects created
     * @param msg
     * @private
     */
    @RabbitSubscribe({
        exchange: process.env.MODULE_NAME,
        routingKey: `${process.env.MODULE_NAME}.${MILESTONE}.${SUB_DB_RECORD_CREATED}`,
        queue: `${process.env.MODULE_NAME}.${PROJECT}.${MILESTONE}.${SUB_DB_RECORD_CREATED}`,
    })
    private async handleMilestoneCreatedEvent(msg: IDbRecordUpdated) {
        console.log('handleMilestoneUpdatedEvent', msg);
        // Handle message
        if(msg.event === LogsConstants.DB_RECORD_CREATED) {
            await this.projectsService.handleProjectMilestoneCreated(msg.principal, msg.id, msg.body);
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
        routingKey: `${process.env.MODULE_NAME}.${MILESTONE}.${SUB_DB_RECORD_UPDATED}`,
        queue: `${process.env.MODULE_NAME}.${PROJECT}.${MILESTONE}.${SUB_DB_RECORD_UPDATED}`,
    })
    private async handleMilestoneUpdatedEvent(msg: IDbRecordUpdated) {

        console.log('handleMilestoneUpdatedEvent', msg);
        // Handle message
        if(msg.event === LogsConstants.DB_RECORD_STAGE_UPDATED) {
            await this.projectsService.handleProjectMilestoneStageUpdated(msg.principal, msg.id, msg.body);
        }
        if(msg.event === LogsConstants.DB_RECORD_UPDATED) {
            await this.projectsService.handleProjectMilestoneUpdated(msg.principal, msg.id, msg.body);
        }
    }

    /**
     *  Handle projects deleted
     * @param msg
     * @private
     */
    @RabbitSubscribe({
        exchange: process.env.MODULE_NAME,
        routingKey: `${process.env.MODULE_NAME}.${MILESTONE}.${SUB_DB_RECORD_DELETED}`,
        queue: `${process.env.MODULE_NAME}.${PROJECT}.${MILESTONE}.${SUB_DB_RECORD_DELETED}`,
    })
    private async handleMilestoneDeletedEvent(msg: IDbRecordUpdated) {

        // Handle message
        if(msg.event === LogsConstants.DB_RECORD_CREATED) {
            await this.projectsService.handleProjectMilestoneDeleted(msg.principal, msg.id, msg.body);
        }
    }


    private static handleError(e) {
        console.error('order event handler error', e);
    }
}
