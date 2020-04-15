import * as dotenv                        from 'dotenv';
import { ServiceClient }                  from "@d19n/client/dist/client/ServiceClient";
import { ApiResponseType }                from "@d19n/common/dist/http/types/ApiResponseType";
import { Utilities }                      from "@d19n/client/dist/helpers/Utilities";
import { SERVICE_NAME }                   from "@d19n/client/dist/helpers/Services";
import { ServiceResponse }                from "@d19n/client/dist/client/ServiceResponse";
import { RBACCreate }                     from "../../src/organizations/users/rbac/types/RBACCreate";
import { OrganizationUserRbacRoleEntity } from "@d19n/models/dist/identity/organization/user/rbac/role/organization.user.rbac.role.entity";
import { IdentityOrganizationUserLoginResponse } from "@d19n/models/dist/identity/organization/user/types/identity.organization.user.login.response";
import { HelpersIdentityApi } from "@d19n/client/dist/helpers/helpers.identity.api";

dotenv.config();


export class RBACControllerHelpers {


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
    public static async createEntityAdminByPrincipal(
        email: string,
        password: string,
        rbacCreate: RBACCreate
    ): Promise<ServiceResponse<ApiResponseType<OrganizationUserRbacRoleEntity>>> {
        const loginResponse = await this.login(email, password);
        return new Promise((resolve, reject) => {
            ServiceClient.call<ApiResponseType<OrganizationUserRbacRoleEntity>>({
                facility: 'http',
                baseUrl: Utilities.getBaseUrl(SERVICE_NAME.IDENTITY_MODULE),
                service: 'v1.0/rbac',
                method: 'post',
                headers: { Authorization: 'Bearer ' + loginResponse.response.token },
                debug: false,
                body: rbacCreate
            }).subscribe(results => {
                resolve(results);
            });
        });
    }

}
