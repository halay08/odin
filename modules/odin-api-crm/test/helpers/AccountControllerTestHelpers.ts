import * as dotenv from "dotenv";
import * as faker from 'faker';
import { ServiceResponse } from "@d19n/client/dist/client/ServiceResponse";
import { ServiceClient } from "@d19n/client/dist/client/ServiceClient";
import { Utilities } from "@d19n/client/dist/helpers/Utilities";
import { SERVICE_NAME } from "@d19n/client/dist/helpers/Services";
import { ApiResponseType } from "@d19n/common/dist/http/types/ApiResponseType";
import { DbRecordEntity } from "@d19n/models/dist/schema-manager/db/record/db.record.entity";
import { HelpersIdentityApi } from "@d19n/client/dist/helpers/helpers.identity.api";
import { IdentityOrganizationUserLoginResponse } from "@d19n/models/dist/identity/organization/user/types/identity.organization.user.login.response";

dotenv.config();


export class AccountControllerTestHelpers {

    /**
     * Construct a new record
     */
    public static constructNewAccount(schemaId: string) {
        return {
            schemaId,
            properties: {
                Type: "RESIDENTIAL",
                Name: faker.name.firstName(),
            },
        }
    }

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

    /**
     *
     * @param leadId
     */
    public static async createAccountFromLead(leadId: string): Promise<ServiceResponse<ApiResponseType<DbRecordEntity>>> {
        const loginResponse = await this.login();
        return new Promise((resolve, reject) => {
            ServiceClient.call<ApiResponseType<DbRecordEntity>>({
                facility: 'http',
                baseUrl: Utilities.getBaseUrl(SERVICE_NAME.CRM_MODULE),
                service: `accounts/from-lead/${leadId}`,
                method: 'post',
                headers: { Authorization: 'Bearer ' + loginResponse.response.token },
                debug: false,
                body: {},
            }).subscribe(results => {
                resolve(results);
            });
        });
    }
}
