import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { DbService } from '@d19n/schema-manager/dist/db/db.service';
import { DbRecordsAssociationsService } from '@d19n/schema-manager/dist/db/records/associations/db.records.associations.service';
import { SchemasService } from '@d19n/schema-manager/dist/schemas/schemas.service';
import { ContactHelpers } from '../../common/contact.helpers';
import { OrderHelpers } from '../../common/order.helpers';
import { VoiceMagratheaHttpClient } from './client';
import { VoiceMagratheaOrderDto } from './dto/voice.magra.order.dto';
import moment = require('moment');
import business = require('moment-business');

export class VoiceMagraOrderService {

    private dbService: DbService;
    private dbRecordsAssociationsService: DbRecordsAssociationsService;
    private schemasService: SchemasService;
    private orderHelpers: OrderHelpers;
    private contactHelpers: ContactHelpers;

    constructor(
        dbService: DbService,
        dbRecordsAssociationsService: DbRecordsAssociationsService,
        schemasService: SchemasService,
        orderHelpers: OrderHelpers,
        contactHelpers: ContactHelpers,
    ) {
        this.dbService = dbService;
        this.dbRecordsAssociationsService = dbRecordsAssociationsService;
        this.schemasService = schemasService;
        this.orderHelpers = orderHelpers;
        this.contactHelpers = contactHelpers;

    }

    /**
     *
     * @param principal
     * @param customerContactId
     */
    public async listAllOrders(principal: OrganizationUserEntity) {
        try {
            const client = new VoiceMagratheaHttpClient();

            const res = await client.getRequest(`/v1/singleport/listall`);

            console.log('res', res);

            return res;
        } catch (e) {
            console.error(e);
        }
    }

    /**
     *
     * @param principal
     * @param customerContactId
     */
    public async listCurrentOrders(principal: OrganizationUserEntity) {
        try {
            const client = new VoiceMagratheaHttpClient();

            const res = await client.getRequest(`/v1/singleport/listcurrent`);

            console.log('res', res);

            return res;
        } catch (e) {
            console.error(e);
        }
    }

    /**
     *
     * @param principal
     * @param customerContactId
     */
    public async getPortingOrderById(principal: OrganizationUserEntity, magOrderId: string) {
        try {
            const client = new VoiceMagratheaHttpClient();

            const res = await client.getRequest(`/v1/singleport/getorder/${magOrderId}`);

            console.log('res', res);

            return res;
        } catch (e) {
            console.error(e);
        }
    }

    /**
     *
     * @param principal
     * @param odnContactId
     */
    public async createNewPhonePortingOrder(principal: OrganizationUserEntity, odnPortingId: string) {
        try {

            // get the phone porting entity > order item
            const customerPhonePorting = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                odnPortingId,
                [ 'OrderItem' ],
            );
            const portingOrderItem = customerPhonePorting['OrderItem'].dbRecords;

            // get the order item > order
            const orderItem = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                portingOrderItem[0].id,
                [ 'Order' ],
            );
            const orderItemOrder = orderItem['Order'].dbRecords;
            // get the order > contact, address
            const orderRes = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                orderItemOrder[0].id,
                [ 'Contact', 'Address' ],
            );
            const orderContact = orderRes['Contact'].dbRecords;
            const orderAddress = orderRes['Address'].dbRecords;

            // Error: "420 - Invalid Address '68 O'Neill Drive'  Required format: [A-Za-z0-9-,.+()&\\s]*"


            const fullNumber = this.constructFullNumberFromPortingRecord(customerPhonePorting);
            const target = `S:${fullNumber}@voip.youfibre.com`;
            // 4. create customer contact in sipwise
            const newOrder = new VoiceMagratheaOrderDto();
            newOrder.MainBillNo = fullNumber;
            newOrder.Target = target;
            newOrder.LoA = 'YES';
            newOrder.Surname = getProperty(orderContact[0], 'LastName');
            newOrder.Address = getProperty(orderAddress[0], 'AddressLine1');
            newOrder.Postcode = getProperty(orderAddress[0], 'PostalCode');
            newOrder.Initials = this.constructContactInitials(orderContact[0]);
            newOrder.PortDate = business.addWeekDays(moment().utc(), 4).format('YYYY-MM-DD');
            newOrder.PortTime = '10:00';

            console.log('newOrder', newOrder);

            const client = new VoiceMagratheaHttpClient();
            const res = await client.postRequest<any>(`/v1/singleport/neworder`, newOrder);

            console.log('res', res);
            // Update the customer phone porting entity  with the Magrathea order id
            await this.dbService.updateDbRecordsByPrincipalAndId(
                principal,
                odnPortingId,
                {
                    entity: `ServiceModule:CustomerPhonePorting`,
                    properties: {
                        MagraOrderId: res.NewOrderNo,
                    },
                },
            );

            return newOrder;
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validators, e.data);
        }
    }


    /**
     *
     * @param customerPhonePorting
     * @private
     */
    private constructFullNumberFromPortingRecord(customerPhonePorting: DbRecordEntityTransform) {

        console.log('customerPhonePorting', customerPhonePorting);

        // const countryCode = getProperty(customerPhonePorting, 'CountryCode');
        const areaCode = getProperty(customerPhonePorting, 'AreaCode');
        const subscriberNumber = getProperty(customerPhonePorting, 'SubscriberNumber');


        return `${areaCode}${subscriberNumber}`;
    }

    /**
     *
     * @param contact
     * @private
     */
    private constructContactInitials(contact: DbRecordEntityTransform) {

        const firstName = getProperty(contact, 'FirstName');
        const lastName = getProperty(contact, 'LastName');

        const firstInitial = firstName.charAt(0);
        const lastInitial = lastName.charAt(0);

        return `${firstInitial}${lastInitial}`;
    }

}
