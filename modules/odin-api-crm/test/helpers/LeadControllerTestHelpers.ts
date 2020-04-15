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
import { DbRecordCreateUpdateDto } from "@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto";

dotenv.config();

export class LeadControllerTestHelpers {

    /**
     * Construct a new record
     */
    public static constructNewLead(schemaId: string) {
        return {
            schemaId,
            title: faker.name.firstName(),
            properties: {
                Type: "RESIDENTIAL",
                Source: "WEBSITE",
                Name: faker.name.firstName(),
                EmailAddress: faker.internet.email(),
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
     * @param leadCreate
     */
    public static async createOne(leadCreate: DbRecordCreateUpdateDto): Promise<ServiceResponse<ApiResponseType<DbRecordEntity>>> {
        const loginResponse = await this.login();
        return new Promise((resolve, reject) => {
            ServiceClient.call<ApiResponseType<DbRecordEntity>>({
                facility: 'http',
                baseUrl: Utilities.getBaseUrl(SERVICE_NAME.CRM_MODULE),
                service: `crm/leads`,
                method: 'post',
                headers: { Authorization: 'Bearer ' + loginResponse.response.token },
                debug: false,
                body: leadCreate,
            }).subscribe(results => {
                resolve(results);
            });
        });
    }
}
