import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import axios from 'axios';
import { Request, Response } from 'express';
import { SERVICE_NAME } from '../helpers/Services';
import { Utilities } from '../helpers/Utilities';

/**
 * Principal Guard for protecting routes and automatically retrieving the users profile.
 */
@Injectable()
export class PrincipalGuard implements CanActivate {

    /**
     * Called before a route is executed.
     *
     * @param {ExecutionContext} context
     * @returns {Promise<boolean>}
     */
    public async canActivate(context: ExecutionContext): Promise<boolean> {

        const ctx = context.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();

        if(request.headers.authorization) {
            try {
                const split = request.headers.authorization.split(' ');

                const path = `${Utilities.getBaseUrl(SERVICE_NAME.IDENTITY_MODULE)}/v1.0/users/my`;
                const res = await axios.get(path, { headers: { Authorization: `Bearer ${split[1]}` } });

                if(res && res.data && res.data.statusCode === 200) {
                    if(res.data.data.status !== 'ACTIVE') {
                        throw new ExceptionType(
                            401,
                            `users is not authorized, current user status: ${res.data.data.status}`,
                        );
                    } else {
                        let principal = res.data.data;
                        principal.headers = request.headers;
                        principal = Object.assign(new OrganizationUserEntity, principal);
                        // @ts-ignore
                        request.principal = principal;
                        return true;
                    }
                } else {
                    response.status(401).json({ message: 'invalid or expired token' });
                    throw new ExceptionType(401, 'response not successful, invalid or expired token');
                }


            } catch (e) {
                console.error(e);
                throw new ExceptionType(401, 'request to authorize failed, invalid or expired token');
            }
        } else {
            throw new ExceptionType(401, 'no authorization header provided');
        }
    }

}
