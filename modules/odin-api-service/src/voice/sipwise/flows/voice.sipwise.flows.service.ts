import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { DbService } from '@d19n/schema-manager/dist/db/db.service';
import { Injectable } from '@nestjs/common';
import { OrderHelpers } from '../../../common/order.helpers';
import { VoiceSipwiseCustomerContactService } from '../customer-contacts/voice.sipwise.customer-contact.service';
import { VoiceSipwiseCustomerService } from '../customer/voice.sipwise.customer.service';
import { VoiceSipwisePhoneNumbersService } from '../phonenumbers/voice.sipwise.phone-numbers.service';
import { IPhoneNumber } from '../subscriber/dto/voice.sipwise.subscriber.dto';
import { VoiceSipwiseSubscriberService } from '../subscriber/voice.sipwise.subscriber.service';


@Injectable()
export class VoiceSipwiseFlowsService {

    private dbService: DbService;
    private voiceSipwiseCustomerService: VoiceSipwiseCustomerService;
    private voiceSipwiseCustomerContactService: VoiceSipwiseCustomerContactService;
    private voiceSipwiseSubscriberService: VoiceSipwiseSubscriberService;
    private voiceSipwisePhoneNumbersService: VoiceSipwisePhoneNumbersService;
    private orderHelpers: OrderHelpers;

    constructor(
        dbService: DbService,
        voiceSipwiseCustomerService: VoiceSipwiseCustomerService,
        voiceSipwiseCustomerContactService: VoiceSipwiseCustomerContactService,
        voiceSipwiseSubscriberService: VoiceSipwiseSubscriberService,
        voiceSipwisePhoneNumbersService: VoiceSipwisePhoneNumbersService,
        orderHelpers: OrderHelpers,
    ) {
        this.dbService = dbService;
        this.voiceSipwiseCustomerService = voiceSipwiseCustomerService;
        this.voiceSipwiseCustomerContactService = voiceSipwiseCustomerContactService;
        this.voiceSipwiseSubscriberService = voiceSipwiseSubscriberService;
        this.voiceSipwisePhoneNumbersService = voiceSipwisePhoneNumbersService;
        this.orderHelpers = orderHelpers;
    }


    /**
     *
     * @param principal
     * @param odnContactId
     */
    public async setupNewCustomer(principal: OrganizationUserEntity, odnOrderId: string) {
        try {

            const identity = 'SIPWISE';

            const { orderContact } = await this.orderHelpers.getOrderRecordsForSettingUpSipswise(principal, odnOrderId);

            // 1. Create Customer Contact
            const customerContact = await this.voiceSipwiseCustomerContactService.createCustomerContact(
                principal,
                odnOrderId,
            );
            console.log('customerContact', customerContact);

            // 2. Get the service
            const service = await this.orderHelpers.getOrderItemVoiceService(
                principal,
                odnOrderId,
            );
            console.log('service', service);

            // 3. Create Customer
            const customer = await this.voiceSipwiseCustomerService.createCustomer(
                principal,
                odnOrderId,
                customerContact.id,
                getProperty(service, 'SipwiseBillingProfileId'),
            );
            console.log('customer', customer);

            // 4. Create Subscriber
            const { subscriber, phoneNumber } = await this.setupNewSubscriberAndPhoneNumber(
                principal,
                service,
                customer.id,
                odnOrderId,
            );

            console.log('subscriber', subscriber);

            // 5. Create a new identity
            await this.dbService.updateOrCreateDbRecordsByPrincipal(principal, [
                {
                    entity: `CrmModule:ContactIdentity`,
                    title: identity,
                    properties: {
                        ExternalId: customerContact.id,
                    },
                    associations: [
                        {
                            recordId: orderContact.id,
                        },
                    ],
                },
            ], { upsert: true });

            return {
                phoneNumber,
                customerContact,
                customer,
                subscriber,
            };

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validators, e.data);
        }
    }


    /**
     *
     * @param principal
     * @param service
     * @param sipCustomerId
     * @param odnOrderId
     * @private
     */
    private async setupNewSubscriberAndPhoneNumber(
        principal: OrganizationUserEntity,
        service: DbRecordEntityTransform,
        sipCustomerId: number,
        odnOrderId: string,
    ) {

        const { order, orderContact, orderItems } = await this.orderHelpers.getOrderRecordsForSettingUpSipswise(
            principal,
            odnOrderId,
        );

        // Get the phone number for the customer if they are porting a number
        let phoneNumber: IPhoneNumber = undefined;
        const portPhoneNumber = await this.voiceSipwisePhoneNumbersService.getCustomerPhoneNumberToPort(
            principal,
            orderItems,
        );

        if(portPhoneNumber) {
            phoneNumber = portPhoneNumber
        } else {
            // Issue a new phone number for the customer if not porting
            const issuedNumber = await this.voiceSipwisePhoneNumbersService.issueNewPhoneNumber(
                principal,
                orderContact.id,
                order.id,
            );
            phoneNumber = issuedNumber;
        }


        // 6. Create a subcscriber in sipwise
        const subscriber = await this.voiceSipwiseSubscriberService.createCustomerSubscribers(
            principal,
            order.id,
            service,
            sipCustomerId,
            phoneNumber,
        )

        if(phoneNumber) {
            // Add phone number to customer
            const newContactPhone = new DbRecordCreateUpdateDto();
            newContactPhone.entity = 'CrmModule:PhoneNumber';
            newContactPhone.properties = {
                FullNumber: `${phoneNumber.cc} ${phoneNumber.ac} ${phoneNumber.sn}`,
            };
            newContactPhone.associations = [
                {
                    recordId: orderContact.id,
                },
                {
                    recordId: order.id, // we add the order relation
                },
            ];
            await this.dbService.updateOrCreateDbRecordsByPrincipal(
                principal,
                [ newContactPhone ],
                { upsert: true },
            );
        }

        return {
            subscriber,
            phoneNumber: `${phoneNumber.cc} ${phoneNumber.ac} ${phoneNumber.sn}`,
        };
    }
}
