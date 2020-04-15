import * as dotenv               from 'dotenv';
import { ServiceClient }         from "@d19n/client/dist/client/ServiceClient";
import { ApiResponseType }       from "@d19n/common/dist/http/types/ApiResponseType";
import { Utilities }             from "@d19n/client/dist/helpers/Utilities";
import { SERVICE_NAME }          from "@d19n/client/dist/helpers/Services";
import { ServiceResponse }       from "@d19n/client/dist/client/ServiceResponse";
import { OrganizationUserTokenCreate } from "@d19n/models/dist/identity/organization/user/token/organization.user.token.create";
import { OrganizationUserTokenEntity } from "@d19n/models/dist/identity/organization/user/token/organization.user.token.entity";
import { IdentityOrganizationUserLoginResponse } from "@d19n/models/dist/identity/organization/user/types/identity.organization.user.login.response";
import { HelpersIdentityApi } from "@d19n/client/dist/helpers/helpers.identity.api";

dotenv.config();


export class TokenControllerHelpers {

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
    public static async create(
        email: string,
        password: string,
        tokenCreate: OrganizationUserTokenCreate
    ): Promise<ServiceResponse<ApiResponseType<OrganizationUserTokenEntity>>> {
        const loginResponse = await this.login(email, password);
        return new Promise((resolve, reject) => {
            ServiceClient.call<ApiResponseType<OrganizationUserTokenEntity>>({
                facility: 'http',
                baseUrl: Utilities.getBaseUrl(SERVICE_NAME.IDENTITY_MODULE),
                service: 'v1.0/tokens',
                method: 'post',
                headers: { Authorization: 'Bearer ' + loginResponse.response.token },
                debug: false,
                body: tokenCreate
            }).subscribe(results => {
                resolve(results);
            });
        });
    }

    /**
     *
     */
    public static async deleteById(
        email: string,
        password: string,
        tokenId: string
    ): Promise<ServiceResponse<ApiResponseType<boolean>>> {
        const loginResponse = await this.login(email, password);
        return new Promise((resolve, reject) => {
            ServiceClient.call<ApiResponseType<boolean>>({
                facility: 'http',
                baseUrl: Utilities.getBaseUrl(SERVICE_NAME.IDENTITY_MODULE),
                service: `v1.0/tokens/${tokenId}`,
                method: 'delete',
                headers: { Authorization: 'Bearer ' + loginResponse.response.token },
                debug: false,
            }).subscribe(results => {
                resolve(results);
            });
        });
    }
}
