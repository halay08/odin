import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { Injectable } from '@nestjs/common';
import { VoiceSipwiseHttpClient } from '../client';
import { VoiceSipwiseCallForwardsDto } from './dto/voice.sipwise.call.forwards.dto';


@Injectable()
export class VoiceSipwiseCallForwardsService {

    constructor() {
    }

    /**
     *
     * @param principal
     * @param query
     */
    public async getCallFowardsBySubscriberId(
        principal: OrganizationUserEntity,
        subscriberId: string,
    ): Promise<any> {
        try {

            const client = new VoiceSipwiseHttpClient();

            const res = await client.getRequest(`callforwards/${subscriberId}`);

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
    public async updateCallForwardsBySubscriberId(
        principal: OrganizationUserEntity,
        subscriberId: string,
        body: VoiceSipwiseCallForwardsDto,
    ): Promise<any> {
        try {

            const newCallForwards = new VoiceSipwiseCallForwardsDto();
            newCallForwards.cft = body.cft;

            const client = new VoiceSipwiseHttpClient();
            const existing = await this.getCallFowardsBySubscriberId(principal, subscriberId);

            delete existing._links;

            const merged = Object.assign({}, existing, newCallForwards);

            const res = await client.putRequest(`callforwards/${subscriberId}`, merged);

            return res;
        } catch (e) {
            console.error(e);
        }
    }


}
