import * as dotenv from 'dotenv';
import { ServiceResponse } from '@d19n/client/dist/client/ServiceResponse';
import { ServiceClient } from '@d19n/client/dist/client/ServiceClient';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { GocardlessCustomerBankAccountEntity } from "../../src/gocardless/customers/bank/accounts/types/gocardless.customer.bank.account.entity";
import { GocardlessCustomerBankAccountResponse } from "../../src/gocardless/customers/bank/accounts/types/gocardless.customer.bank.account.response";
import { HelpersIdentityApi } from "@d19n/client/dist/helpers/helpers.identity.api";
import { IdentityOrganizationUserLoginResponse } from "@d19n/models/dist/identity/organization/user/types/identity.organization.user.login.response";

dotenv.config();


export class GocardlessCustomersBankAccountsControllerHelpers {

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


    public static async listAll(): Promise<ServiceResponse<ApiResponseType<GocardlessCustomerBankAccountResponse[]>>> {
        const loginResponse = await this.login();
        return new Promise((resolve, reject) => {
            ServiceClient.call<ApiResponseType<GocardlessCustomerBankAccountResponse[]>>({
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

    public static async createOne(body: GocardlessCustomerBankAccountEntity): Promise<ServiceResponse<ApiResponseType<GocardlessCustomerBankAccountEntity>>> {
        const loginResponse = await this.login();
        return new Promise((resolve, reject) => {
            ServiceClient.call<ApiResponseType<GocardlessCustomerBankAccountEntity>>({
                facility: 'http',
                baseUrl: Utilities.getBaseUrl(SERVICE_NAME.BILLING_MODULE),
                service: 'v1.0/gocardless/bank-accounts',
                method: 'post',
                headers: { Authorization: 'Bearer ' + loginResponse.response.token },
                debug: false,
                body,
            }).subscribe(results => {
                resolve(results);
            });
        });
    }

    public static async getOne(bankAccountId: string): Promise<ServiceResponse<ApiResponseType<GocardlessCustomerBankAccountEntity>>> {
        const loginResponse = await this.login();
        return new Promise((resolve, reject) => {
            ServiceClient.call<ApiResponseType<GocardlessCustomerBankAccountEntity>>({
                facility: 'http',
                baseUrl: Utilities.getBaseUrl(SERVICE_NAME.BILLING_MODULE),
                service: `v1.0/gocardless/bank-accounts/${bankAccountId}`,
                method: 'post',
                headers: { Authorization: 'Bearer ' + loginResponse.response.token },
                debug: false,
            }).subscribe(results => {
                resolve(results);
            });
        });
    }

    public static async updateOne(
        bankAccountId: string,
        body: GocardlessCustomerBankAccountEntity,
    ): Promise<ServiceResponse<ApiResponseType<GocardlessCustomerBankAccountEntity>>> {
        const loginResponse = await this.login();
        return new Promise((resolve, reject) => {
            ServiceClient.call<ApiResponseType<GocardlessCustomerBankAccountEntity>>({
                facility: 'http',
                baseUrl: Utilities.getBaseUrl(SERVICE_NAME.BILLING_MODULE),
                service: `v1.0/gocardless/bank-accounts/${bankAccountId}`,
                method: 'put',
                headers: { Authorization: 'Bearer ' + loginResponse.response.token },
                debug: false,
                body,
            }).subscribe(results => {
                resolve(results);
            });
        });
    }

    public static async disableOne(
        bankAccountId: string,
    ): Promise<ServiceResponse<ApiResponseType<GocardlessCustomerBankAccountEntity>>> {
        const loginResponse = await this.login();
        return new Promise((resolve, reject) => {
            ServiceClient.call<ApiResponseType<GocardlessCustomerBankAccountEntity>>({
                facility: 'http',
                baseUrl: Utilities.getBaseUrl(SERVICE_NAME.BILLING_MODULE),
                service: `v1.0/gocardless/bank-accounts/${bankAccountId}/action/disable`,
                method: 'post',
                headers: { Authorization: 'Bearer ' + loginResponse.response.token },
                debug: false,
            }).subscribe(results => {
                resolve(results);
            });
        });
    }

}
