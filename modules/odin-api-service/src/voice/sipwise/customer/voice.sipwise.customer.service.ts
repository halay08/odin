import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { Injectable } from '@nestjs/common';
import { VoiceSipwiseHttpClient } from '../client';
import { ISipwiseGetCustomers } from '../interfaces/interfaces';
import { VoiceSipwiseCustomerDto } from './dto/voice.sipwise.customer.dto';


@Injectable()
export class VoiceSipwiseCustomerService {

    constructor() {
    }

    /**
     *
     * @param principal
     * @param orderId
     * @paramsipContactId
     * @param billingProfileId
     */
    async createCustomer(
        principal: OrganizationUserEntity,
        orderId: string,
        sipContactId: number,
        billingProfileId: string,
    ) {
        try {

            // create customer in sipwise
            const newCustomer = new VoiceSipwiseCustomerDto();
            newCustomer.status = 'active';
            newCustomer.contact_id = sipContactId;
            newCustomer.billing_profile_id = billingProfileId;
            newCustomer.billing_profile_definition = 'id';
            newCustomer.type = 'sipaccount';
            newCustomer.external_id = orderId;
            newCustomer.vat_rate = 0;
            newCustomer.add_vat = false;

            const client = new VoiceSipwiseHttpClient();
            const res = await client.postRequest<any>(`customers/`, newCustomer);

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
    public async getCustomerById(principal: OrganizationUserEntity, customerId: string) {
        try {
            const client = new VoiceSipwiseHttpClient();

            const res = await client.getRequest(`customers/${customerId}`);

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
    async searchCustomers(principal: OrganizationUserEntity, query: ISipwiseGetCustomers) {

        try {

            const client = new VoiceSipwiseHttpClient();

            if(query) {

                let path = 'customers/';

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

                return res['ngcp:customers'] ? res['ngcp:customers'] : [];

            }

            return [];

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validators, e.data);
        }
    }

    /**
     *
     * @param principal
     * @param customerId
     */
    public async deleteCustomerById(principal: OrganizationUserEntity, customerId: string) {
        try {

            const client = new VoiceSipwiseHttpClient();
            // we need to update the customers status to terminate

            const customer = await this.getCustomerById(principal, customerId);
            const merged = Object.assign({}, customer, { 'status': 'terminated' });

            console.log('merged', merged);

            const res = await client.putRequest(`customers/${customerId}`, merged);

            return res['ngcp:customers'];

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validators, e.data);
        }
    }
}
