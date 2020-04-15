import * as dotenv from 'dotenv';
import { ServiceResponse } from '@d19n/client/dist/client/ServiceResponse';
import { ServiceClient } from '@d19n/client/dist/client/ServiceClient';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { HelpersIdentityApi } from "@d19n/client/dist/helpers/helpers.identity.api";
import { IdentityOrganizationUserLoginResponse } from "@d19n/models/dist/identity/organization/user/types/identity.organization.user.login.response";
import { GocardlessPaymentEntity } from "../../src/gocardless/payments/types/gocardless.payment.entity";
import { GocardlessPaymentResponse } from "../../src/gocardless/payments/types/gocardless.payment.response";

dotenv.config();


export class GocardlessPaymentsControllerHelpers {

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


    public static async listAll(): Promise<ServiceResponse<ApiResponseType<GocardlessPaymentResponse[]>>> {
        const loginResponse = await this.login();
        return new Promise((resolve, reject) => {
            ServiceClient.call<ApiResponseType<GocardlessPaymentResponse[]>>({
                facility: 'http',
                baseUrl: Utilities.getBaseUrl(SERVICE_NAME.BILLING_MODULE),
                service: 'v1.0/gocardless/payments',
                method: 'get',
                headers: { Authorization: 'Bearer ' + loginResponse.response.token },
                debug: false,
            }).subscribe(results => {
                resolve(results);
            });
        });
    }

    public static async createOne(body: GocardlessPaymentEntity): Promise<ServiceResponse<ApiResponseType<GocardlessPaymentEntity>>> {
        const loginResponse = await this.login();
        return new Promise((resolve, reject) => {
            ServiceClient.call<ApiResponseType<GocardlessPaymentEntity>>({
                facility: 'http',
                baseUrl: Utilities.getBaseUrl(SERVICE_NAME.BILLING_MODULE),
                service: 'v1.0/gocardless/payments',
                method: 'post',
                headers: { Authorization: 'Bearer ' + loginResponse.response.token },
                debug: false,
                body,
            }).subscribe(results => {
                resolve(results);
            });
        });
    }

    public static async getOne(paymentId: string): Promise<ServiceResponse<ApiResponseType<GocardlessPaymentEntity>>> {
        const loginResponse = await this.login();
        return new Promise((resolve, reject) => {
            ServiceClient.call<ApiResponseType<GocardlessPaymentEntity>>({
                facility: 'http',
                baseUrl: Utilities.getBaseUrl(SERVICE_NAME.BILLING_MODULE),
                service: `v1.0/gocardless/payments/${paymentId}`,
                method: 'post',
                headers: { Authorization: 'Bearer ' + loginResponse.response.token },
                debug: false,
            }).subscribe(results => {
                resolve(results);
            });
        });
    }

    public static async updateOne(
        paymentId: string,
        body: GocardlessPaymentEntity,
    ): Promise<ServiceResponse<ApiResponseType<GocardlessPaymentEntity>>> {
        const loginResponse = await this.login();
        return new Promise((resolve, reject) => {
            ServiceClient.call<ApiResponseType<GocardlessPaymentEntity>>({
                facility: 'http',
                baseUrl: Utilities.getBaseUrl(SERVICE_NAME.BILLING_MODULE),
                service: `v1.0/gocardless/payments/${paymentId}`,
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
