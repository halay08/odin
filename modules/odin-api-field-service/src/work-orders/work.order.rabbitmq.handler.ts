import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { LogsConstants } from '@d19n/models/dist/logs/logs.constants';
import {
    SUB_CANCEL,
    SUB_DB_RECORD_ASSOCIATION_CREATED,
    SUB_DB_RECORD_DELETED,
    SUB_DB_RECORD_UPDATED,
} from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import {
    IDbRecordAssociationCreated,
    IDbRecordDeleted,
    IDbRecordUpdated,
} from '@d19n/models/dist/rabbitmq/rabbitmq.interfaces';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { splitEntityToModuleAndEntity } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { DbService } from '@d19n/schema-manager/dist/db/db.service';
import { DbRecordsAssociationsService } from '@d19n/schema-manager/dist/db/records/associations/db.records.associations.service';
import { PipelineEntitysService } from '@d19n/schema-manager/dist/pipelines/pipelines.service';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { ServiceAppointmentsService } from '../service-appointment/service.appointments.service';
import { WorkOrderService } from './work.order.service';

const { WORK_ORDER, SERVICE_APPOINTMENT } = SchemaModuleEntityTypeEnums;

dotenv.config();

@Injectable()
export class WorkOrderRabbitmqHandler {

    private dbService: DbService;
    private dbRecordsAssociationsService: DbRecordsAssociationsService;
    private serviceAppointmentsService: ServiceAppointmentsService;
    private pipelinesService: PipelineEntitysService;
    private workOrderService: WorkOrderService;

    constructor(
        @Inject(forwardRef(() => DbRecordsAssociationsService)) dbRecordsAssociationsService: DbRecordsAssociationsService,
        @Inject(forwardRef(() => DbService)) dbService: DbService,
        serviceAppointmentsService: ServiceAppointmentsService,
        workOrderService: WorkOrderService,
        pipelinesService: PipelineEntitysService,
    ) {
        this.dbService = dbService;
        this.dbRecordsAssociationsService = dbRecordsAssociationsService;
        this.serviceAppointmentsService = serviceAppointmentsService;
        this.pipelinesService = pipelinesService;
        this.workOrderService = workOrderService;
    }


    /**
     *
     * @param msg
     * @private
     */
    @RabbitSubscribe({
        exchange: process.env.MODULE_NAME,
        routingKey: `${process.env.MODULE_NAME}.${SERVICE_APPOINTMENT}.${SUB_DB_RECORD_DELETED}`,
        queue: `${process.env.MODULE_NAME}.${WORK_ORDER}.${SERVICE_APPOINTMENT}.${SUB_DB_RECORD_DELETED}`,
    })
    private async handleServiceAppointmentDeletedEvent(msg: IDbRecordDeleted) {

        try {
            // Handle message
            if(msg.event === LogsConstants.DB_RECORD_DELETED) {
                await this.workOrderService.handleWorkOrderServiceAppointmentDeleted(
                    msg.principal,
                    msg.id,
                );
            }
        } catch (e) {
            console.error(e);
        }
    }

    /**
     *
     * @param msg
     * @private
     */
    @RabbitSubscribe({
        exchange: process.env.MODULE_NAME,
        routingKey: `${process.env.MODULE_NAME}.${WORK_ORDER}.${SUB_DB_RECORD_UPDATED}`,
        queue: `${process.env.MODULE_NAME}.${WORK_ORDER}.${SUB_DB_RECORD_UPDATED}`,
    })
    private async handleRecordUpdatedEvent(msg: IDbRecordUpdated) {
        if(msg.event === LogsConstants.DB_RECORD_STAGE_UPDATED) {
            await this.workOrderService.handleStageChange(msg.principal, msg.id, msg.body);
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
        queue: `${process.env.MODULE_NAME}.${WORK_ORDER}.${SUB_DB_RECORD_ASSOCIATION_CREATED}`,
    })
    private async handleDbRecordAssociationCreated(msg: IDbRecordAssociationCreated) {

        if(msg.dbRecordAssociation) {
            // Handle message
            const splitParent = splitEntityToModuleAndEntity(msg.dbRecordAssociation.parentEntity);
            const splitChild = splitEntityToModuleAndEntity(msg.dbRecordAssociation.childEntity);
            // Handle discounts
            if(splitParent.entityName === WORK_ORDER && splitChild.entityName === SERVICE_APPOINTMENT) {

                const { childRecordId } = msg.dbRecordAssociation;

                await this.workOrderService.handleWorkOrderServiceAppointmentCreated(
                    msg.principal,
                    childRecordId,
                );
            }
        }
    }


    /**
     * When cancelling a work order we want to
     * cancel the customer work order
     * cancel build work orders that are not in build scheduled
     * and delete the current service appointment on the customer work order
     * @param msg
     */
    @RabbitSubscribe({
        exchange: process.env.MODULE_NAME,
        routingKey: `${process.env.MODULE_NAME}.${WORK_ORDER}.${SUB_CANCEL}`,
        queue: `${process.env.MODULE_NAME}.${WORK_ORDER}.${SUB_CANCEL}`,
    })
    public async cancelWorkOrderByPrincipalAndId(msg: any) {
        try {
            const { WORK_ORDER, SERVICE_APPOINTMENT } = SchemaModuleEntityTypeEnums;
            console.log('cancel work order');

            const customerWorkOrder = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                msg.principal.organization,
                msg.workOrderId,
                [ WORK_ORDER, SERVICE_APPOINTMENT ],
            );

            const workOrderPipeline = await this.pipelinesService.getPipelineAndStagesByModuleName(
                msg.principal.organization,
                SchemaModuleTypeEnums.FIELD_SERVICE_MODULE,
                WORK_ORDER,
            );

            // Get the work order pipeline
            const customerWorkOrderCancelledStage = workOrderPipeline.stages.find(elem => elem.key === 'WorkOrderStageCancelled');
            // Move work order to cancelled if it is not in the Done stage
            if(customerWorkOrder.stage.position < 3) {
                const body = new DbRecordCreateUpdateDto();
                body.schemaId = customerWorkOrder.schemaId;
                body.stageId = customerWorkOrderCancelledStage.id;
                await this.dbService.updateDbRecordsByPrincipalAndId(msg.principal, msg.workOrderId, body);
            }
            // Delete service appointment
            if(customerWorkOrder[SERVICE_APPOINTMENT] && customerWorkOrder[SERVICE_APPOINTMENT].dbRecords) {
                await this.dbService.deleteByPrincipalAndId(
                    msg.principal,
                    customerWorkOrder[SERVICE_APPOINTMENT].dbRecords[0].id,
                );
            }
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation, e.data);
        }
    }
}
