import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { VoiceSipwiseCallForwardsService } from '../call-forwarding/voice.sipwise.call.forwards.service';
import { VoiceSipwiseHttpClient } from '../client';
import { ISipwiseGetSubscribers } from '../interfaces/interfaces';
import { IPhoneNumber, VoiceSipwiseSubscriberDto } from './dto/voice.sipwise.subscriber.dto';


@Injectable()
export class VoiceSipwiseSubscriberService {

    private readonly voiceSipwiseCallForwardsService: VoiceSipwiseCallForwardsService

    constructor(
        voiceSipwiseCallForwardsService: VoiceSipwiseCallForwardsService,
    ) {
        this.voiceSipwiseCallForwardsService = voiceSipwiseCallForwardsService;
    }

    /**
     *
     * @param principal
     * @param orderId
     * @param service
     * @param sipCustomerId
     * @param primaryPhone
     */
    async createCustomerSubscribers(
        principal: OrganizationUserEntity,
        orderId: string,
        service: DbRecordEntityTransform,
        sipCustomerId: number,
        primaryPhone: IPhoneNumber,
    ) {
        try {

            // generate password using a uuid
            const uuid = uuidv4();
            const split = uuid.split('-');
            const password = split[4];

            if(!primaryPhone && !primaryPhone.sn) {
                throw new ExceptionType(422, 'Missing phone number subscriber number (sn)');
            }

            // create customer in sipwise
            const newSubscriber = new VoiceSipwiseSubscriberDto();
            newSubscriber.status = 'active';
            newSubscriber.customer_id = sipCustomerId;
            newSubscriber.primary_number = primaryPhone;
            newSubscriber.domain_id = getProperty(service, 'SipwiseDomainId')
            newSubscriber.username = `${primaryPhone.ac}${primaryPhone.sn}`;
            newSubscriber.password = password;
            newSubscriber.webusername = `${primaryPhone.ac}${primaryPhone.sn}`;
            newSubscriber.password = password;
            newSubscriber.external_id = orderId;


            const client = new VoiceSipwiseHttpClient();
            const res = await client.postRequest<any>(`subscribers/`, newSubscriber);

            // Set call forwarding for voicemail
            await this.voiceSipwiseCallForwardsService.updateCallForwardsBySubscriberId(principal, res.id, {
                cft: {
                    'destinations': [
                        {
                            'announcement_id': null,
                            'destination': 'voicebox',
                            'priority': 1,
                            'timeout': 15,
                        },
                    ],
                },
            });

            return res;
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validators);
        }

    }

    /**
     *
     * @param principal
     * @param query
     */
    public async searchSubscribers(
        principal: OrganizationUserEntity,
        query: ISipwiseGetSubscribers,
    ): Promise<any[]> {
        try {

            const client = new VoiceSipwiseHttpClient();

            if(query) {

                let path = 'subscribers/';

                const queryKeys = Object.keys(query);

                for(let idx = 0; idx < queryKeys.length; idx++) {
                    // for the first param add the query param and value
                    if(idx === 0) {
                        path = `${path}?${queryKeys[idx]}=${query[queryKeys[idx]]}`
                    } else {
                        // for all additional params add the ampersand and query param and value
                        path = `${path}&${queryKeys[idx]}=${query[queryKeys[idx]]}`
                    }
                }


                const res = await client.getRequest(path);

                return res['ngcp:subscribers'] ? res['ngcp:subscribers'] : [];

            }

            return [];

        } catch (e) {
            console.error(e);
        }
    }

    /**
     *
     * @param principal
     * @param customerId
     */
    async terminateSubscriberById(principal: OrganizationUserEntity, subscriberId: string) {

        try {

            const client = new VoiceSipwiseHttpClient();
            const res = await client.deleteRequest<any>(`subscribers/${subscriberId}`);

            return res;

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validators, e.data);
        }
    }
}
