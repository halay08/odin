import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { DbService } from '@d19n/schema-manager/dist/db/db.service';
import { Injectable } from '@nestjs/common';
import { ContactHelpers } from '../../../common/contact.helpers';
import { OrderHelpers } from '../../../common/order.helpers';
import { VoiceSipwiseHttpClient } from '../client';
import { VoiceSipwiseCustomerService } from '../customer/voice.sipwise.customer.service';
import { VoiceSipwiseCustomerContactDto } from './dto/voice.sipwise.customer-contact.dto';


@Injectable()
export class VoiceSipwiseCustomerContactService {

    private dbService: DbService;
    private voiceSipwiseCustomerService: VoiceSipwiseCustomerService;
    private orderHelpers: OrderHelpers;
    private contactHelpers: ContactHelpers;

    constructor(
        dbService: DbService,
        voiceSipwiseCustomerService: VoiceSipwiseCustomerService,
        orderHelpers: OrderHelpers,
        contactHelpers: ContactHelpers,
    ) {
        this.dbService = dbService;
        this.voiceSipwiseCustomerService = voiceSipwiseCustomerService;
        this.orderHelpers = orderHelpers;
        this.contactHelpers = contactHelpers;

    }

    /**
     *
     * @param principal
     */
    public async listCustomerContacts(principal: OrganizationUserEntity) {
        try {
            const client = new VoiceSipwiseHttpClient();

            const res = await client.getRequest('customercontacts');

            return res['ngcp:customercontacts'];

        } catch (e) {
            console.error(e);
        }
    }

    /**
     *
     * @param principal
     * @param customerContactId
     */
    public async getCustomerContactsById(principal: OrganizationUserEntity, customerContactId: string) {
        try {
            const client = new VoiceSipwiseHttpClient();

            const res = await client.getRequest(`customercontacts/${customerContactId}`);

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
    public async createCustomerContact(principal: OrganizationUserEntity, odnOrderId: string) {
        try {

            const identity = 'SIPWISE';

            // 1. get odin contact
            const order = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                odnOrderId,
                [ 'Contact', 'Address', 'OrderItem' ],
            );

            const orderContact = order['Contact'].dbRecords;
            const orderAddress = order['Address'].dbRecords;

            // 2. Get the service
            const service = await this.orderHelpers.getOrderItemVoiceService(principal, odnOrderId);
            const sipwiseIdentity = await this.contactHelpers.getSipwiseContactIdentity(principal, orderContact[0].id);

            // 3. verify if there is a Contact Identity for sipwise
            if(sipwiseIdentity) {
                throw new ExceptionType(409, 'customer already exists in sipwise', [], sipwiseIdentity);
            }

            // 4. create customer contact in sipwise
            const newCustomerContact = new VoiceSipwiseCustomerContactDto();
            newCustomerContact.firstname = getProperty(orderContact[0], 'FirstName');
            newCustomerContact.lastname = getProperty(orderContact[0], 'LastName');
            newCustomerContact.email = getProperty(orderContact[0], 'EmailAddress');
            newCustomerContact.street = getProperty(orderAddress[0], 'AddressLine1');
            newCustomerContact.postcode = getProperty(orderAddress[0], 'PostalCode');
            newCustomerContact.city = getProperty(orderAddress[0], 'City');
            newCustomerContact.country = getProperty(orderAddress[0], 'CountryCode');
            newCustomerContact.reseller_id = getProperty(service, 'SipwiseResellerId') || 2; // reseller id 2 = YouFibre

            const client = new VoiceSipwiseHttpClient();
            const res = await client.postRequest<any>(`customercontacts/`, newCustomerContact);
            console.log('sipwise identity', res);

            // 5. Create a new identity
            await this.dbService.updateOrCreateDbRecordsByPrincipal(principal, [
                {
                    entity: `CrmModule:ContactIdentity`,
                    title: identity,
                    properties: {
                        ExternalId: res.id,
                    },
                    associations: [
                        {
                            recordId: orderContact[0].id,
                        },
                    ],
                },
            ], { upsert: true });

            return res;

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validators, e.data);
        }
    }

    /**
     *
     * @param principal
     * @param customerContactId
     */
    public async deleteCustomerContactById(principal: OrganizationUserEntity, customerContactId: string) {
        try {
            const client = new VoiceSipwiseHttpClient();

            const res = await client.deleteRequest(`customercontacts/${customerContactId}`);

            return res;

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validators, e.data);
        }
    }
}
