import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { DbService } from '@d19n/schema-manager/dist/db/db.service';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { IPhoneNumber } from '../subscriber/dto/voice.sipwise.subscriber.dto';
import { VoiceSipwisePhoneNumbersRepository } from './voice.sipwise.phone-numbers.repository';


@Injectable()
export class VoiceSipwisePhoneNumbersService extends VoiceSipwisePhoneNumbersRepository {

    private dbService: DbService;

    constructor(
        @InjectConnection('odinDb') connection: Connection,
        dbService: DbService,
    ) {
        super(connection);

        this.dbService = dbService;
    }


    /**
     *
     * @param principal
     * @param orderOrderItem
     * @private
     */
    public async getCustomerPhoneNumberToPort(
        principal: OrganizationUserEntity,
        orderOrderItems: DbRecordEntityTransform[],
    ): Promise<IPhoneNumber | undefined> {

        try {
            const voiceItem = orderOrderItems.filter(elem => getProperty(elem, 'ProductCategory') === 'VOICE');

            if(!voiceItem) {
                throw new ExceptionType(422, 'This order is missing a voice product');
            }
            // 2.1 Get the OrderItem and CustomerPhonePorting entry if exists
            const orderItem = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                voiceItem[0].id,
                [ 'CustomerPhonePorting' ],
            );
            const customerPhonePorting = orderItem['CustomerPhonePorting'].dbRecords;
            if(customerPhonePorting) {
                // return the PhoneNumber from the porting entry
                return {
                    cc: getProperty(customerPhonePorting[0], 'CountryCode'),
                    ac: getProperty(customerPhonePorting[0], 'AreaCode'),
                    sn: getProperty(customerPhonePorting[0], 'SubscriberNumber'),
                };
            }

            return undefined;

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }

    /**
     *
     * @param principal
     * @param orderOrderItem
     * @private
     */
    public async issueNewPhoneNumber(
        principal: OrganizationUserEntity,
        contactId: string,
        orderId: string,
    ): Promise<IPhoneNumber> {
        try {

            // Get the next available phone number from the database
            const phoneNumber = await this.getNextAvailablePhoneNumber(principal);
            console.log('phoneNumber', phoneNumber);
            // Update the phone number in the database with the orderId and contactId
            if(!phoneNumber) {
                throw new ExceptionType(500, 'could not issue a new phone number');
            }
            await this.updatePhoneNumberById(principal, phoneNumber.id, orderId, contactId);
            // return the PhoneNumber
            return {
                cc: phoneNumber.country_code,
                ac: phoneNumber.area_code,
                sn: phoneNumber.subscriber_number,
            };

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }

    /**
     *
     * @param principal
     * @param orderId
     */
    async getPhoneNumbersByOrderId(principal: OrganizationUserEntity, orderId: string) {
        try {

            return await this.getPhoneNumberByOrderId(principal, orderId);

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }
}
