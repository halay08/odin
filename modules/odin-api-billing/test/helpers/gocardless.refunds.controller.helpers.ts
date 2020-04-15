import * as dotenv from 'dotenv';
import { ServiceResponse } from '@d19n/client/dist/client/ServiceResponse';
import { ServiceClient } from '@d19n/client/dist/client/ServiceClient';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { HelpersIdentityApi } from "@d19n/client/dist/helpers/helpers.identity.api";
import { IdentityOrganizationUserLoginResponse } from "@d19n/models/dist/identity/organization/user/types/identity.organization.user.login.response";
import { GocardlessRefundResponse } from "../../src/gocardless/refunds/types/gocardless.refund.response";
import { GocardlessRefundEntity } from "../../src/gocardless/refunds/types/gocardless.refund.entity";

dotenv.config();


export class GocardlessRefundsControllerHelpers {

    public static async login(): Promise<ServiceResponse<IdentityOrganizationUserLoginResponse>> {
        return new Promise((resolve, reject) => {
            HelpersIdentityApi.login(process.env.TEST_EMAIL, process.env.TEST_PASSWORD).subscribe(loginResponse => {
                if(!loginResponse.successful) {
                    console.log(loginResponse);
                }
                resolve(loginResponse);
            });
        });
    }


    public static async listAll(): Promise<ServiceResponse<ApiResponseType<GocardlessRefundResponse[]>>> {
        const loginResponse = await this.login();
        return new Promise((resolve, reject) => {
            ServiceClient.call<ApiResponseType<GocardlessRefundResponse[]>>({
                facility: 'http',
                baseUrl: Utilities.getBaseUrl(SERVICE_NAME.BILLING_MODULE),
                service: 'v1.0/gocardless/refunds',
                method: 'get',
                headers: { Authorization: 'Bearer ' + loginResponse.response.token },
                debug: false,
            }).subscribe(results => {
                resolve(results);
            });
        });
    }

    public static async createOne(body: GocardlessRefundEntity): Promise<ServiceResponse<ApiResponseType<GocardlessRefundEntity>>> {
        const loginResponse = await this.login();
        return new Promise((resolve, reject) => {
            ServiceClient.call<ApiResponseType<GocardlessRefundEntity>>({
                facility: 'http',
                baseUrl: Utilities.getBaseUrl(SERVICE_NAME.BILLING_MODULE),
                service: 'v1.0/gocardless/refunds',
                method: 'post',
                headers: { Authorization: 'Bearer ' + loginResponse.response.token },
                debug: false,
                body,
            }).subscribe(results => {
                resolve(results);
            });
        });
    }

    public static async getOne(refundId: string): Promise<ServiceResponse<ApiResponseType<GocardlessRefundEntity>>> {
        const loginResponse = await this.login();
        return new Promise((resolve, reject) => {
            ServiceClient.call<ApiResponseType<GocardlessRefundEntity>>({
                facility: 'http',
                baseUrl: Utilities.getBaseUrl(SERVICE_NAME.BILLING_MODULE),
                service: `v1.0/gocardless/refunds/${refundId}`,
                method: 'post',
                headers: { Authorization: 'Bearer ' + loginResponse.response.token },
                debug: false,
            }).subscribe(results => {
                resolve(results);
            });
        });
    }

    public static async updateOne(
        refundId: string,
        body: GocardlessRefundEntity,
    ): Promise<ServiceResponse<ApiResponseType<GocardlessRefundEntity>>> {
        const loginResponse = await this.login();
        return new Promise((resolve, reject) => {
            ServiceClient.call<ApiResponseType<GocardlessRefundEntity>>({
                facility: 'http',
                baseUrl: Utilities.getBaseUrl(SERVICE_NAME.BILLING_MODULE),
                service: `v1.0/gocardless/refunds/${refundId}`,
                method: 'put',
                headers: { Authorization: 'Bearer ' + loginResponse.response.token },
                debug: false,
                body,
            }).subscribe(results => {
                resolve(results);
            });
        });
    }

}
