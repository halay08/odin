import * as dotenv from 'dotenv';
import { ServiceResponse } from '@d19n/client/dist/client/ServiceResponse';
import { ServiceClient } from '@d19n/client/dist/client/ServiceClient';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { GocardlessCustomerMandateResponse } from "../../src/gocardless/customers/mandates/types/gocardless.customer.mandate.response";
import { GocardlessCustomerMandateEntity } from "../../src/gocardless/customers/mandates/types/gocardless.customer.mandate.entity";
import { HelpersIdentityApi } from "@d19n/client/dist/helpers/helpers.identity.api";
import { IdentityOrganizationUserLoginResponse } from "@d19n/models/dist/identity/organization/user/types/identity.organization.user.login.response";

dotenv.config();


export class GocardlessCustomersMandatesControllerHelpers {

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


    public static async listAll(): Promise<ServiceResponse<ApiResponseType<GocardlessCustomerMandateResponse[]>>> {
        const loginResponse = await this.login();
        return new Promise((resolve, reject) => {
            ServiceClient.call<ApiResponseType<GocardlessCustomerMandateResponse[]>>({
                facility: 'http',
                baseUrl: Utilities.getBaseUrl(SERVICE_NAME.BILLING_MODULE),
                service: 'v1.0/gocardless/bank-accounts',
                method: 'get',
                headers: { Authorization: 'Bearer ' + loginResponse.response.token },
                debug: false,
            }).subscribe(results => {
                resolve(results);
            });
        });
    }

    public static async createOne(body: GocardlessCustomerMandateEntity): Promise<ServiceResponse<ApiResponseType<GocardlessCustomerMandateEntity>>> {
        const loginResponse = await this.login();
        return new Promise((resolve, reject) => {
            ServiceClient.call<ApiResponseType<GocardlessCustomerMandateEntity>>({
                facility: 'http',
                baseUrl: Utilities.getBaseUrl(SERVICE_NAME.BILLING_MODULE),
                service: 'v1.0/gocardless/mandates',
                method: 'post',
                headers: { Authorization: 'Bearer ' + loginResponse.response.token },
                debug: false,
                body,
            }).subscribe(results => {
                resolve(results);
            });
        });
    }

    public static async getOne(mandateId: string): Promise<ServiceResponse<ApiResponseType<GocardlessCustomerMandateEntity>>> {
        const loginResponse = await this.login();
        return new Promise((resolve, reject) => {
            ServiceClient.call<ApiResponseType<GocardlessCustomerMandateEntity>>({
                facility: 'http',
                baseUrl: Utilities.getBaseUrl(SERVICE_NAME.BILLING_MODULE),
                service: `v1.0/gocardless/mandates/${mandateId}`,
                method: 'post',
                headers: { Authorization: 'Bearer ' + loginResponse.response.token },
                debug: false,
            }).subscribe(results => {
                resolve(results);
            });
        });
    }

    public static async updateOne(
        mandateId: string,
        body: GocardlessCustomerMandateEntity,
    ): Promise<ServiceResponse<ApiResponseType<GocardlessCustomerMandateEntity>>> {
        const loginResponse = await this.login();
        return new Promise((resolve, reject) => {
            ServiceClient.call<ApiResponseType<GocardlessCustomerMandateEntity>>({
                facility: 'http',
                baseUrl: Utilities.getBaseUrl(SERVICE_NAME.BILLING_MODULE),
                service: `v1.0/gocardless/mandates/${mandateId}`,
                method: 'put',
                headers: { Authorization: 'Bearer ' + loginResponse.response.token },
                debug: false,
                body,
            }).subscribe(results => {
                resolve(results);
            });
        });
    }

    public static async cancelOne(
        mandateId: string,
    ): Promise<ServiceResponse<ApiResponseType<GocardlessCustomerMandateEntity>>> {
        const loginResponse = await this.login();
        return new Promise((resolve, reject) => {
            ServiceClient.call<ApiResponseType<GocardlessCustomerMandateEntity>>({
                facility: 'http',
                baseUrl: Utilities.getBaseUrl(SERVICE_NAME.BILLING_MODULE),
                service: `v1.0/gocardless/mandates/${mandateId}/action/cancel`,
                method: 'post',
                headers: { Authorization: 'Bearer ' + loginResponse.response.token },
                debug: false,
            }).subscribe(results => {
                resolve(results);
            });
        });
    }

    public static async reinstateOne(
        mandateId: string,
    ): Promise<ServiceResponse<ApiResponseType<GocardlessCustomerMandateEntity>>> {
        const loginResponse = await this.login();
        return new Promise((resolve, reject) => {
            ServiceClient.call<ApiResponseType<GocardlessCustomerMandateEntity>>({
                facility: 'http',
                baseUrl: Utilities.getBaseUrl(SERVICE_NAME.BILLING_MODULE),
                service: `v1.0/gocardless/mandates/${mandateId}/action/reinstate`,
                method: 'post',
                headers: { Authorization: 'Bearer ' + loginResponse.response.token },
                debug: false,
            }).subscribe(results => {
                resolve(results);
            });
        });
    }

}
