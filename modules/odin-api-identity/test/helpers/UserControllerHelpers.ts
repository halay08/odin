import * as faker                 from "faker";
import * as dotenv                from 'dotenv';
import { ServiceClient }          from "@d19n/client/dist/client/ServiceClient";
import { ApiResponseType }        from "@d19n/common/dist/http/types/ApiResponseType";
import { OrganizationUserEntity } from "@d19n/models/dist/identity/organization/user/organization.user.entity";
import { Utilities }              from "@d19n/client/dist/helpers/Utilities";
import { SERVICE_NAME }           from "@d19n/client/dist/helpers/Services";
import { ServiceResponse }        from "@d19n/client/dist/client/ServiceResponse";
import { IdentityOrganizationUserRegister } from "@d19n/models/dist/identity/organization/user/types/identity.organization.user.register";
import { IdentityOrganizationUserLoginResponse } from "@d19n/models/dist/identity/organization/user/types/identity.organization.user.login.response";
import { HelpersIdentityApi } from "@d19n/client/dist/helpers/helpers.identity.api";
import { IdentityOrganizationUserChangePassword } from "@d19n/models/dist/identity/organization/user/types/identity.organization.user.change.password";
import { OrganizationUserCreate } from "@d19n/models/dist/identity/organization/user/organization.user.create";

dotenv.config();

export class OrganizationUserEntityControllerHelpers {

    /**
     *
     * @param email
     * @param password
     */
    public static constructRegisterOrganizationUserEntity(
        email: string,
        password: string
    ): IdentityOrganizationUserRegister {
        return {
            organizationName: faker.company.companyName(),
            email: email || faker.internet.email(),
            password: password || 'testing',
            firstname: faker.name.firstName(),
            lastname: faker.name.lastName()
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
    public static async userRegisterNewOrganizationEntity(userRegister: IdentityOrganizationUserRegister): Promise<ServiceResponse<ApiResponseType<OrganizationUserEntity>>> {
        const loginResponse = await this.login();
        return new Promise((resolve, reject) => {
            ServiceClient.call<ApiResponseType<OrganizationUserEntity>>({
                facility: 'http',
                baseUrl: Utilities.getBaseUrl(SERVICE_NAME.IDENTITY_MODULE),
                service: 'v1.0/users/register',
                method: 'post',
                headers: { Authorization: 'Bearer ' + loginResponse.response.token },
                debug: false,
                body: userRegister
            }).subscribe(results => {
                resolve(results);
            });
        });
    }


    /**
     *
     */
    public static async userGerMyProfile(
        email?: string,
        password?: string
    ): Promise<ServiceResponse<ApiResponseType<OrganizationUserEntity>>> {
        const loginResponse = await this.login(email, password);
        return new Promise((resolve, reject) => {
            ServiceClient.call<ApiResponseType<OrganizationUserEntity>>({
                facility: 'http',
                baseUrl: Utilities.getBaseUrl(SERVICE_NAME.IDENTITY_MODULE),
                service: 'v1.0/users/my',
                method: 'get',
                headers: { Authorization: 'Bearer ' + loginResponse.response.token },
                debug: false,
            }).subscribe(results => {
                resolve(results);
            });
        });
    }

    /**
     *
     */
    public static async createUserByPrincipal(
        email: string,
        password: string,
        body: OrganizationUserCreate,
    ): Promise<ServiceResponse<ApiResponseType<OrganizationUserEntity>>> {
        const loginResponse = await this.login(email, password);
        return new Promise((resolve, reject) => {
            ServiceClient.call<ApiResponseType<OrganizationUserEntity>>({
                facility: 'http',
                baseUrl: Utilities.getBaseUrl(SERVICE_NAME.IDENTITY_MODULE),
                service: 'v1.0/users',
                method: 'post',
                headers: { Authorization: 'Bearer ' + loginResponse.response.token },
                body,
                debug: false,
            }).subscribe(results => {
                resolve(results);
            });
        });
    }



    /**
     *
     */
    public static async userChangePassword(changePassword: IdentityOrganizationUserChangePassword): Promise<ServiceResponse<ApiResponseType<OrganizationUserEntity[]>>> {
        const loginResponse = await this.login();
        return new Promise((resolve, reject) => {
            ServiceClient.call<ApiResponseType<OrganizationUserEntity[]>>({
                facility: 'http',
                baseUrl: Utilities.getBaseUrl(SERVICE_NAME.IDENTITY_MODULE),
                service: 'v1.0/users/change-password',
                method: 'get',
                headers: { Authorization: 'Bearer ' + loginResponse.response.token },
                debug: false,
                body: changePassword
            }).subscribe(results => {
                resolve(results);
            });
        });
    }


    /**
     *
     */
    public static async listAllByOrganizationEntity(): Promise<ServiceResponse<ApiResponseType<OrganizationUserEntity[]>>> {
        const loginResponse = await this.login();
        return new Promise((resolve, reject) => {
            ServiceClient.call<ApiResponseType<OrganizationUserEntity[]>>({
                facility: 'http',
                baseUrl: Utilities.getBaseUrl(SERVICE_NAME.IDENTITY_MODULE),
                service: 'v1.0/users/byorg',
                method: 'get',
                headers: { Authorization: 'Bearer ' + loginResponse.response.token },
                debug: false
            }).subscribe(results => {
                resolve(results);
            });
        });
    }


    /**
     *
     */
    public static async activateById(
        userId: string
    ): Promise<ServiceResponse<ApiResponseType<OrganizationUserEntity>>> {
        return new Promise((resolve, reject) => {
            ServiceClient.call<ApiResponseType<OrganizationUserEntity>>({
                facility: 'http',
                baseUrl: Utilities.getBaseUrl(SERVICE_NAME.IDENTITY_MODULE),
                service: `v1.0/users/activate/${userId}`,
                method: 'patch',
                headers: {},
                debug: false,
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
        userId: string
    ): Promise<ServiceResponse<ApiResponseType<{ affected: number }>>> {
        const loginResponse = await this.login(email, password);
        return new Promise((resolve, reject) => {
            ServiceClient.call<ApiResponseType<{ affected: number }>>({
                facility: 'http',
                baseUrl: Utilities.getBaseUrl(SERVICE_NAME.IDENTITY_MODULE),
                service: `v1.0/users/${userId}`,
                method: 'delete',
                headers: { Authorization: 'Bearer ' + loginResponse.response.token },
                debug: false,
            }).subscribe(results => {
                resolve(results);
            });
        });
    }

}
