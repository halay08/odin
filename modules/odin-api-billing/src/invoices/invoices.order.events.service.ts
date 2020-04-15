import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { DbService } from '@d19n/schema-manager/dist/db/db.service';
import { DbRecordsAssociationsService } from '@d19n/schema-manager/dist/db/records/associations/db.records.associations.service';
import { DbRecordsService } from '@d19n/schema-manager/dist/db/records/db.records.service';
import { PipelineEntitysStagesService } from '@d19n/schema-manager/dist/pipelines/stages/pipelines.stages.service';
import { SchemasService } from '@d19n/schema-manager/dist/schemas/schemas.service';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { InvoicesService } from './invoices.service';
import moment = require('moment');


const { INVOICE } = SchemaModuleEntityTypeEnums;

dotenv.config();

@Injectable()
export class InvoicesOrderEventsService extends InvoicesService {

    private pipelineStagesService: PipelineEntitysStagesService;

    constructor(
        schemasService: SchemasService,
        dbRecordsService: DbRecordsService,
        @Inject(forwardRef(() => DbRecordsAssociationsService)) dbRecordsAssociationsService: DbRecordsAssociationsService,
        @Inject(forwardRef(() => DbService)) dbService: DbService,
        amqpConnection: AmqpConnection,
        pipelineStagesService: PipelineEntitysStagesService,
    ) {
        super(schemasService, dbRecordsService, dbRecordsAssociationsService, dbService, amqpConnection);

        this.pipelineStagesService = pipelineStagesService;

    }

    /**
     * When the order is moved to active we want to generate an invoice if no invoices exist
     * @param principal
     * @param id
     */
    async handleOrderStageChange(principal: OrganizationUserEntity, orderId: string, body: DbRecordCreateUpdateDto) {

        try {

            const stage = await this.pipelineStagesService.getPipelineStageByOrganizationAndId(
                principal.organization,
                body.stageId,
            );

            if(stage && stage.name.toLowerCase() === 'active') {

                const order = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                    principal.organization,
                    orderId,
                    [ INVOICE ],
                );

                const orderInvoices = order[INVOICE].dbRecords;

                // if the order does not have invoices generate the first invoice
                if(!orderInvoices) {
                    // check if the billing start date is today or before today
                    const billingStartDate = getProperty(order, 'BillingStartDate');
                    // If the billing start date for the order is today or before today then generate the invoice
                    if(billingStartDate && moment(billingStartDate).isValid()) {
                        await this.createInvoiceFromOrder(principal, order.id);
                    }
                }
            }

        } catch (e) {
            console.error(e);
        }

    }
}
