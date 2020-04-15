import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { Injectable } from '@nestjs/common';
import { VoiceSipwiseHttpClient } from '../client';
import { VoiceSipwiseSubscriberPreferenceDto } from './dto/voice.sipwise.subscriber.preference.dto';


@Injectable()
export class VoiceSipwiseSubscriberPreferenceService {

    constructor() {
    }

    /**
     *
     * @param principal
     * @param query
     */
    public async getSubscriberPreferenceBySubscriberId(
        principal: OrganizationUserEntity,
        subscriberId: string,
    ): Promise<any> {
        try {

            const client = new VoiceSipwiseHttpClient();

            const res = await client.getRequest(`subscriberpreferences/${subscriberId}`);

            console.log('res', res);

            return res;

        } catch (e) {
            console.error(e);
        }
    }

    /**
     *
     * @param principal
     * @param query
     */
    public async updateSubscriberPreferenceBySubscriberId(
        principal: OrganizationUserEntity,
        subscriberId: string,
        body: VoiceSipwiseSubscriberPreferenceDto,
    ): Promise<any> {
        try {

            const newPreferences = new VoiceSipwiseSubscriberPreferenceDto();
            newPreferences.ringtimeout = body.ringtimeout;

            const client = new VoiceSipwiseHttpClient();
            const existing = await this.getSubscriberPreferenceBySubscriberId(principal, subscriberId);

            delete existing._links;
            delete existing.id;
            delete existing.subscriber_id;

            const merged = Object.assign({}, existing, newPreferences);

            const res = await client.putRequest(`subscriberpreferences/${subscriberId}`, merged);

            return res;

        } catch (e) {
            console.error(e);
        }
    }


}
