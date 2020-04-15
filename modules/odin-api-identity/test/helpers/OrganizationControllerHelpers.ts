import * as faker                from "faker";
import * as dotenv               from 'dotenv';
import { ServiceClient }         from "@d19n/client/dist/client/ServiceClient";
import { ApiResponseType }       from "@d19n/common/dist/http/types/ApiResponseType";
import { Utilities }             from "@d19n/client/dist/helpers/Utilities";
import { SERVICE_NAME }          from "@d19n/client/dist/helpers/Services";
import { ServiceResponse }       from "@d19n/client/dist/client/ServiceResponse";
import { IdentityOrganizationUserLoginResponse } from "@d19n/models/dist/identity/organization/user/types/identity.organization.user.login.response";
import { HelpersIdentityApi } from "@d19n/client/dist/helpers/helpers.identity.api";

dotenv.config();

export class OrganizationEntityControllerHelpers {

    /**
     * name
     */
    public static constructNewOrganizationEntity(name: string): { name: string } {
        return {
            name: faker.company.companyName(),
        };
    }


    /**
     * Get logged in user
     */
    public static async login(
        email?: string,
        password?: string
    ): Promise<ServiceResponse<IdentityOrganizationUserLoginResponse>> {
        return new Promise((resolve, reject) => {
            HelpersIdentityApi.login(email || process.env.TEST_EMAIL, password || process.env.TEST_PASSWORD).subscribe(loginResponse => {
                if ( !loginResponse.successful ) {
                    console.log(loginResponse);
                }
                resolve(loginResponse);
            });
        });
    }


    /**
     *
     */
    public static async deleteById(
        email: string,
        password: string,
        organizationId: string
    ): Promise<ServiceResponse<ApiResponseType<{ affected: number }>>> {
        const loginResponse = await this.login(email, password);
        return new Promise((resolve, reject) => {
            ServiceClient.call<ApiResponseType<{ affected: number }>>({
                facility: 'http',
                baseUrl: Utilities.getBaseUrl(SERVICE_NAME.IDENTITY_MODULE),
                service: `v1.0/organizations/${organizationId}`,
                method: 'delete',
                headers: { Authorization: 'Bearer ' + loginResponse.response.token },
                debug: false,
            }).subscribe(results => {
                resolve(results);
            });
        });
    }
}
