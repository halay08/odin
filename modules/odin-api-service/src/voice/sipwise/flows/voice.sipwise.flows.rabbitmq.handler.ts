import { SUB_DB_RECORD_DELETED } from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import { IDbRecordDeleted } from '@d19n/models/dist/rabbitmq/rabbitmq.interfaces';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { DbService } from '@d19n/schema-manager/dist/db/db.service';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { VoiceSipwiseCustomerContactService } from '../customer-contacts/voice.sipwise.customer-contact.service';

const { SERVICE_MODULE } = SchemaModuleTypeEnums;
const { CONTACT_IDENTITY } = SchemaModuleEntityTypeEnums;

@Injectable()
export class VoiceSipwiseFlowsRabbitmqHandler {


    private dbService: DbService;
    private readonly voiceSipwiseCustomerContactService: VoiceSipwiseCustomerContactService

    constructor(
        dbService: DbService,
        voiceSipwiseCustomerContactService: VoiceSipwiseCustomerContactService,
    ) {

        this.dbService = dbService;
        this.voiceSipwiseCustomerContactService = voiceSipwiseCustomerContactService;

    }

    /**
     *
     * @param msg
     * @private
     */
    @RabbitSubscribe({
        exchange: SERVICE_MODULE,
        routingKey: `${SERVICE_MODULE}.${CONTACT_IDENTITY}.${SUB_DB_RECORD_DELETED}`,
        queue: `${process.env.MODULE_NAME}.SipwiseCustomerContact.${SUB_DB_RECORD_DELETED}`,
    })
    private async handleCustomerDeviceRouterUpdated(msg: IDbRecordDeleted) {
        // Handle message

        const record = await this.dbService.getDbRecordTransformedByOrganizationAndId(
            msg.principal.organization,
            msg.id,
            [],
        );

        const name = getProperty(record, 'Name');
        const externalId = getProperty(record, 'ExternalId');

        if(name === 'SIPWISE') {
            await this.voiceSipwiseCustomerContactService.deleteCustomerContactById(msg.principal, externalId);
        }
    }
}
