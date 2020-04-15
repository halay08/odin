import * as dotenv from 'dotenv';
import { ServiceResponse } from '@d19n/client/dist/client/ServiceResponse';
import { ServiceClient } from '@d19n/client/dist/client/ServiceClient';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { GocardlessBankLookupEntity } from "../../src/gocardless/bank-lookup/types/gocardless.bank.lookup.entity";
import { HelpersIdentityApi } from "@d19n/client/dist/helpers/helpers.identity.api";
import { IdentityOrganizationUserLoginResponse } from "@d19n/models/dist/identity/organization/user/types/identity.organization.user.login.response";

dotenv.config();


export class GocardlessBankLookupControllerHelpers {

    public static async login(): Promise<ServiceResponse<IdentityOrganizationUserLoginResponse>> {
        return new Promise((resolve, reject) => {
            HelpersIdentityApi.login(process.env.TEST_EMAIL, process.env.TEST_PASSWORD).subscribe(loginResponse => {
                if ( !loginResponse.successful ) {
                    console.log(loginResponse);
                }
                resolve(loginResponse);
            });
        });
    }

    public static async lookupOne(body: GocardlessBankLookupEntity): Promise<ServiceResponse<ApiResponseType<GocardlessBankLookupEntity>>> {
        const loginResponse = await this.login();
        return new Promise((resolve, reject) => {
            ServiceClient.call<ApiResponseType<GocardlessBankLookupEntity>>({
                facility: 'http',
                baseUrl: Utilities.getBaseUrl(SERVICE_NAME.BILLING_MODULE),
                service: 'v1.0/gocardless/bank-lookup',
                method: 'post',
                headers: { Authorization: 'Bearer ' + loginResponse.response.token },
                debug: false,
                body,
            }).subscribe(results => {
                resolve(results);
            });
        });
    }

}
