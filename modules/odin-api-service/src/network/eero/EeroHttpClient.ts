import { RxHR } from '@akanass/rx-http-request';
import { ServiceCall } from '@d19n/client/dist/client/ServiceCall';
import { ServiceClient } from '@d19n/client/dist/client/ServiceClient';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationAppEntity } from '@d19n/models/dist/identity/organization/app/organization.app.entity';
import * as dotenv from 'dotenv';

dotenv.config();

export class EeroHttpClient {

    public httpRequest<T>(
        serviceCall: ServiceCall,
    ): Promise<T> {
        return new Promise(async (resolve, reject) => {
            const options = {
                headers: serviceCall.headers,
                body: serviceCall.body,
                json: true,
                debug: true,
            };

            RxHR[serviceCall.method]<T>(`${serviceCall.baseUrl}${serviceCall.service}${serviceCall.params && serviceCall.params.length > 0 ? ServiceClient.getQueryParams(
                serviceCall.params) : ''}`, options).subscribe((data) => {

                console.log('EEROCLIENT', data.body);

                if(!data.body) {
                    return reject(new ExceptionType(404, 'not found'));
                } else if(data.body['data']) {
                    return resolve(data.body['data']);
                } else if(data.body['meta'] && data.body['meta']['code'] === 404) {
                    return reject(new ExceptionType(404, 'not found'));
                } else {
                    // speed test omits the data
                    return resolve(data.body['meta']);
                }
            }, (err) => {
                return reject(new ExceptionType(500, err.message));
            });
        });
    }


    /**
     *
     * @param connectedApp
     * @param service
     */
    public getRequest<T>(
        connectedApp: OrganizationAppEntity,
        service: string,
    ): Promise<T> {
        return new Promise(async (resolve, reject) => {
            try {
                const serviceCall = new ServiceCall();
                serviceCall.facility = 'http';
                serviceCall.service = service;
                serviceCall.baseUrl = connectedApp.baseUrl; // from the organizations connected apps
                serviceCall.method = 'get';
                serviceCall.headers = {
                    Accept: 'application/json',
                    'X-User-Token': connectedApp.apiKey,
                };

                const res = await this.httpRequest<T>(serviceCall);

                return resolve(res);
            } catch (e) {
                return reject(e);
            }
        });
    }

    /**
     *
     * @param service
     * @param body
     * @param baseUrl
     * @param jwtToken
     */
    public postRequest<T>(
        connectedApp: OrganizationAppEntity,
        service: string,
        body: any,
    ): Promise<T> {
        return new Promise(async (resolve, reject) => {
            try {
                const serviceCall = new ServiceCall();
                serviceCall.facility = 'http';
                serviceCall.service = service;
                serviceCall.baseUrl = connectedApp.baseUrl;
                serviceCall.method = 'post';
                serviceCall.headers = {
                    Accept: 'application/json',
                    'X-User-Token': connectedApp.apiKey,
                };
                serviceCall.body = body;

                const res = await this.httpRequest<T>(serviceCall);

                return resolve(res);
            } catch (e) {
                return reject(e);
            }
        });
    }

    /**
     *
     * @param service
     * @param body
     * @param baseUrl
     * @param jwtToken
     */
    public postFormData<T>(
        connectedApp: OrganizationAppEntity,
        service: string,
        body: any,
    ): Promise<T> {
        return new Promise(async (resolve, reject) => {
            try {
                const serviceCall = new ServiceCall();
                serviceCall.facility = 'http';
                serviceCall.service = service;
                serviceCall.baseUrl = connectedApp.baseUrl;
                serviceCall.method = 'post';
                serviceCall.headers = {
                    Accept: 'application/json',
                    'X-User-Token': connectedApp.apiKey,
                };
                serviceCall.body = body;

                const res = await this.httpRequest<T>(serviceCall);

                return resolve(res);
            } catch (e) {
                return reject(e);
            }
        });
    }

    /**
     *
     * @param baseUrl
     * @param service
     * @param jwtToken
     * @param body
     */
    public putRequest<T>(
        connectedApp: OrganizationAppEntity,
        service: string,
        body: any,
    ): Promise<T> {
        return new Promise(async (resolve, reject) => {
            try {

                const serviceCall = new ServiceCall();
                serviceCall.facility = 'http';
                serviceCall.service = service;
                serviceCall.baseUrl = connectedApp.baseUrl;
                serviceCall.method = 'put';
                serviceCall.headers = {
                    Accept: 'application/json',
                    'X-User-Token': connectedApp.apiKey,
                };
                serviceCall.body = body;

                const res = await this.httpRequest<T>(serviceCall);

                return resolve(res);
            } catch (e) {
                return reject(e);
            }
        });
    }

    /**
     *
     * @param baseUrl
     * @param service
     * @param jwtToken
     */
    public deleteRequest<T>(
        connectedApp: OrganizationAppEntity,
        service: string,
    ): Promise<T> {
        return new Promise(async (resolve, reject) => {
            try {
                const serviceCall = new ServiceCall();
                serviceCall.facility = 'http';
                serviceCall.service = service;
                serviceCall.baseUrl = connectedApp.baseUrl;
                serviceCall.method = 'delete';
                serviceCall.headers = {
                    Accept: 'application/json',
                    'X-User-Token': connectedApp.apiKey,
                };

                const res = await this.httpRequest<T>(serviceCall);

                return resolve(res);
            } catch (e) {
                return reject(e);
            }
        });
    }

}
