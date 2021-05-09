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
import { ProgramsService } from './programs.service';

const { PROGRAM, PROJECT } = SchemaModuleEntityTypeEnums;

@Injectable()
export class ProgramsRabbitmqHandler {

    constructor(private readonly programsService: ProgramsService) {

        this.programsService = programsService;
    }

    /**
     *  Handle projects created
     * @param msg
     * @private
     */
    @RabbitSubscribe({
        exchange: process.env.MODULE_NAME,
        routingKey: `${process.env.MODULE_NAME}.${PROJECT}.${SUB_DB_RECORD_CREATED}`,
        queue: `${process.env.MODULE_NAME}.${PROGRAM}.${PROJECT}.${SUB_DB_RECORD_CREATED}`,
    })
    private async handleProjectCreatedEvent(msg: IDbRecordUpdated) {

        // Handle message
        if(msg.event === LogsConstants.DB_RECORD_CREATED) {
            this.programsService.handleProgramProjectCreated(msg.principal, msg.id, msg.body);
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
        routingKey: `${process.env.MODULE_NAME}.${PROJECT}.${SUB_DB_RECORD_UPDATED}`,
        queue: `${process.env.MODULE_NAME}.${PROGRAM}.${PROJECT}.${SUB_DB_RECORD_UPDATED}`,
    })
    private async handleProjectUpdatedEvent(msg: IDbRecordUpdated) {

        // Handle message
        if(msg.event === LogsConstants.DB_RECORD_STAGE_UPDATED) {
            this.programsService.handleProgramProjectStageUpdated(msg.principal, msg.id, msg.body);
        }
        if(msg.event === LogsConstants.DB_RECORD_UPDATED) {
            this.programsService.handleProgramProjectUpdated(msg.principal, msg.id, msg.body);
        }
    }

    /**
     *  Handle projects deleted
     * @param msg
     * @private
     */
    @RabbitSubscribe({
        exchange: process.env.MODULE_NAME,
        routingKey: `${process.env.MODULE_NAME}.${PROJECT}.${SUB_DB_RECORD_DELETED}`,
        queue: `${process.env.MODULE_NAME}.${PROGRAM}.${PROJECT}.${SUB_DB_RECORD_DELETED}`,
    })
    private async handleProjectDeletedEvent(msg: IDbRecordUpdated) {

        // Handle message
        if(msg.event === LogsConstants.DB_RECORD_CREATED) {
            this.programsService.handleProgramProjectDeleted(msg.principal, msg.id, msg.body);
        }
    }

    private static handleError(e) {
        console.error('order event handler error', e);
    }
}
