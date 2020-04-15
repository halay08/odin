import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { DbService } from '@d19n/schema-manager/dist/db/db.service';
import { DbRecordsAssociationsService } from '@d19n/schema-manager/dist/db/records/associations/db.records.associations.service';
import { SchemasService } from '@d19n/schema-manager/dist/schemas/schemas.service';
import { Injectable } from '@nestjs/common';
import { ContactHelpers } from '../../../../common/contact.helpers';
import { OrderHelpers } from '../../../../common/order.helpers';
import { VoiceSipwiseSubscriberService } from '../../../../voice/sipwise/subscriber/voice.sipwise.subscriber.service';
import { IDeactivateVoiceResponse } from '../../olt/interfaces/network.adtran.olt.interfaces';
import { NetworkAdtranOltService } from '../../olt/network.adtran.olt.service';

const SPLIT_ORDER = 'SplitOrder';
const { ORDER, CONTACT } = SchemaModuleEntityTypeEnums;


@Injectable()
export class NetworkAdtranOnuVoiceService {

    private dbService: DbService;
    private dbRecordsAssociationsService: DbRecordsAssociationsService;
    private schemasService: SchemasService;
    private orderHelpers: OrderHelpers;
    private contactHelpers: ContactHelpers;
    private voiceSipwiseSubscriberService: VoiceSipwiseSubscriberService;
    private networkAdtranOltService: NetworkAdtranOltService;

    constructor(
        dbService: DbService,
        dbRecordsAssociationsService: DbRecordsAssociationsService,
        schemasService: SchemasService,
        orderHelpers: OrderHelpers,
        contactHelpers: ContactHelpers,
        voiceSipwiseSubscriberService: VoiceSipwiseSubscriberService,
        networkAdtranOltService: NetworkAdtranOltService,
    ) {

        this.dbService = dbService;
        this.dbRecordsAssociationsService = dbRecordsAssociationsService;
        this.schemasService = schemasService;
        this.orderHelpers = orderHelpers;
        this.contactHelpers = contactHelpers;
        this.voiceSipwiseSubscriberService = voiceSipwiseSubscriberService;

        this.networkAdtranOltService = networkAdtranOltService;
    }


    /**
     *
     * @param principal
     * @param orderItemId
     * @param body
     */
    public async activateServiceByOrderItemId(principal: OrganizationUserEntity, orderItemId: string): Promise<any> {
        try {

            const { oltIp, onuInterfaceName, order } = await this.getVoiceParamsFromOrder(principal, orderItemId);

            const { port, onuId } = this.networkAdtranOltService.transformInterfaceNameFromOltConfig(onuInterfaceName);

            let phoneAreaCode;
            let phoneSubscriberNumber;
            let sipPassword;

            const subscribers = await this.voiceSipwiseSubscriberService.searchSubscribers(
                principal,
                { customer_external_id: order.id },
            );

            if(subscribers && subscribers[0]) {

                phoneAreaCode = subscribers[0].primary_number.ac;
                phoneSubscriberNumber = subscribers[0].primary_number.sn;
                sipPassword = subscribers[0].password;

            } else {
                throw new ExceptionType(400, 'missing sipwise subscriber');
            }

            const res = await this.networkAdtranOltService.activateVoice(
                principal,
                { oltIp, port, onuId, phoneAreaCode, phoneSubscriberNumber, sipPassword },
            );

            return res;

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }

    /**
     *
     * @param principal
     * @param orderItemId
     * @param body
     */
    public async deactivateServiceByOrderItem(principal: OrganizationUserEntity, orderItemId: string): Promise<any> {

        try {

            const { oltIp, onuInterfaceName } = await this.getVoiceParamsFromOrder(principal, orderItemId);

            const { port, onuId } = this.networkAdtranOltService.transformInterfaceNameFromOltConfig(onuInterfaceName);

            const res: IDeactivateVoiceResponse = await this.networkAdtranOltService.deactivateVoice(
                principal,
                { oltIp, port, onuId },
            );

            return res;

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }


    /**
     *
     * @param principal
     * @param orderItemId
     * @private
     */
    private async getVoiceParamsFromOrder(principal: OrganizationUserEntity, orderItemId: string) {
        try {
            // get the order for this order item
            const orderItem = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                orderItemId,
                [ ORDER, SPLIT_ORDER ],
            );
            const order = orderItem[ORDER].dbRecords;
            const orderItemSplitOrder = orderItem[SPLIT_ORDER].dbRecords;

            // Check if the item has a split order
            // If it does > get the split order > get the order item with the base broadband from the order
            // provision the service

            // if there is no split order
            // then we should use the order that the voice item is being activated from
            let orderId;

            if(orderItemSplitOrder) {
                const splitOrder = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                    principal.organization,
                    orderItemSplitOrder[0].id,
                    [ ORDER ],
                );

                // A split order will always have 2 orders
                // the originating order
                // and the new order after the split
                const splitOrderOrders = splitOrder[ORDER].dbRecords;
                const originatingOrder = splitOrderOrders.filter(elem => elem.id !== order[0].id);

                orderId = originatingOrder[0].id;
            } else {
                orderId = order[0].id;
            }

            // get the order items
            const orderRes = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                orderId,
                [ CONTACT ],
            );
            const orderContact = orderRes[CONTACT].dbRecords;

            // get the sipwise contact identity
            const sipwiseIdentity = await this.contactHelpers.getSipwiseContactIdentity(
                principal,
                orderContact[0].id,
            );
            if(!sipwiseIdentity) {
                throw new ExceptionType(422, 'Missing sipwise identity for the contact on the order');
            }

            // get the ont device from the base broadband order item
            const ontDevice = await this.orderHelpers.getOrderCustomerDeviceOnt(principal, orderId);

            const oltIp = getProperty(ontDevice, 'OltIpAddress');
            const onuInterfaceName = getProperty(ontDevice, 'OnuInterfaceName');

            if(!oltIp) {
                throw new ExceptionType(422, 'The base broadband ONT is missing an olt Ip address');
            }

            // The device must be activated before adding voice to the config
            if(!onuInterfaceName) {
                throw new ExceptionType(422, 'The base broaband ONT is missing an onu interface name');
            }

            return { oltIp, onuInterfaceName, order: order[0] };

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }

}
