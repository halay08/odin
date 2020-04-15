import * as dotenv from 'dotenv';
import { ServiceResponse } from '@d19n/client/dist/client/ServiceResponse';
import { ServiceClient } from '@d19n/client/dist/client/ServiceClient';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { DbRecordEntity } from "@d19n/models/dist/schema-manager/db/record/db.record.entity";
import * as faker from "faker";
import { IdentityOrganizationUserLoginResponse } from "@d19n/models/dist/identity/organization/user/types/identity.organization.user.login.response";
import { HelpersIdentityApi } from "@d19n/client/dist/helpers/helpers.identity.api";

dotenv.config();


export class PaymentMethodsControllerHelpers {

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


    /**
     * Construct a new contact
     */
    public static constructNewContact(schemaId: string) {
        return {
            schemaId,
            properties: {
                FirstName: faker.name.findName(),
                LastName: faker.name.lastName(),
                EmailAddress: faker.internet.exampleEmail(),
                Phone: faker.phone.phoneNumber(),
                Mobile: faker.phone.phoneNumber(),
            },
        }
    }

    public static async createCustomerMandatePaymentMethod(
        contactId,
        body: any,
    ): Promise<ServiceResponse<ApiResponseType<DbRecordEntity>>> {
        const loginResponse = await this.login();
        return new Promise((resolve, reject) => {
            ServiceClient.call<ApiResponseType<DbRecordEntity>>({
                facility: 'http',
                baseUrl: Utilities.getBaseUrl(SERVICE_NAME.BILLING_MODULE),
                service: `v1.0/contact/${contactId}/payment-methods`,
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
