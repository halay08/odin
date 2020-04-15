import { Observable } from 'rxjs';
import { ServiceClient } from '../client/ServiceClient';
import { ServiceResponse } from '../client/ServiceResponse';
import { SERVICE_NAME } from './Services';
import { Utilities } from './Utilities';

export class HelpersIdentityApi {

    /**
     * Perform a login request returning the {R} object with the jwt token.
     *
     * @param {string} email
     * @param {string} password
     * @param {boolean} debug
     *
     */
    public static login<R>(
        email: string,
        password: string,
        debug: boolean = false,
    ): Observable<ServiceResponse<R>> {
        console.log(`HelpersIdentityApi.login: Using url ${Utilities.getBaseUrl(SERVICE_NAME.IDENTITY_MODULE)}`);
        return ServiceClient.call<R>({
            facility: 'http',
            service: 'v1.0/users/login',
            method: 'post',
            baseUrl: Utilities.getBaseUrl(SERVICE_NAME.IDENTITY_MODULE),
            body: {
                email,
                password,
            },
            debug,
        });
    }

    /**
     * Retrieve the users profile information based on the jwt token.
     *
     * @param {string} jwt
     * @param {boolean} debug
     *
     */
    public static getMyProfile<R>(
        jwt: string,
        debug: boolean = false,
    ): Observable<ServiceResponse<R>> {
        return ServiceClient.call<R>({
            facility: 'http',
            service: 'v1.0/users/my',
            method: 'get',
            baseUrl: Utilities.getBaseUrl(SERVICE_NAME.IDENTITY_MODULE),
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
            debug: debug,
        });
    }

}
