import { RxHR } from '@akanass/rx-http-request';
import { ServiceCall } from '@d19n/client/dist/client/ServiceCall';
import { ServiceClient } from '@d19n/client/dist/client/ServiceClient';
import { ClassValidatorExceptionType } from '@d19n/common/dist/exceptions/types/ClassValidatorExceptionType';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationAppEntity } from '@d19n/models/dist/identity/organization/app/organization.app.entity';
import * as dotenv from 'dotenv';

dotenv.config();

export class BaseHttpClient {

    public httpRequest<T>(
        serviceCall: ServiceCall,
    ): Promise<T> {
        return new Promise(async (resolve, reject) => {

            const options = {
                headers: serviceCall.headers,
                body: serviceCall.body,
                json: true,
            };

            console.log('serviceCall', serviceCall);
            RxHR[serviceCall.method]<T>(`${serviceCall.baseUrl}${serviceCall.service}${serviceCall.params && serviceCall.params.length > 0 ? ServiceClient.getQueryParams(
                serviceCall.params) : ''}`, options).subscribe((data) => {
                if(data.response.statusCode === 200 || data.response.statusCode === 201) {
                    return resolve(data.body);
                } else if(data.response.statusCode === 204) {
                    // entity deleted
                    return resolve(data.body);
                } else if(data.response.statusCode === 410) {
                    // entity has already been removed
                    return resolve(data.body);
                } else if(data.response.statusCode === 400) {

                    const classValidator = new ClassValidatorExceptionType();
                    classValidator.constraints = data.body['error']['errors'];
                    return reject(new ExceptionType(
                        data.response.statusCode,
                        data.body['error']['message'],
                        [ classValidator ],
                    ));

                } else if(data.response.statusCode === 422) {

                    const classValidator = new ClassValidatorExceptionType();
                    classValidator.constraints = data.body['error']['errors'];
                    return reject(new ExceptionType(
                        data.response.statusCode,
                        data.body['error']['message'],
                        [ classValidator ],
                    ));

                } else if(data.response.statusCode === 409) {

                    console.error(data.body['error']['errors']);
                    const errors = data.body['error']['errors'];
                    const links = errors[0] ? errors[0]['links'] : null;
                    console.log('links', links);

                    const classValidator = new ClassValidatorExceptionType();
                    classValidator.constraints = data.body['error']['errors'];
                    return reject(new ExceptionType(
                        data.response.statusCode,
                        data.body['error']['message'],
                        [ classValidator ],
                        links,
                    ));

                } else {
                    console.log(' data.body.error', data.body['error']);
                    const classValidator = new ClassValidatorExceptionType();
                    classValidator.constraints = data.body['error']['errors'];
                    return reject(new ExceptionType(
                        data.response.statusCode,
                        data.body['error']['message'],
                        [ classValidator ],
                    ));
                }
            }, (err) => {
                console.error(`BaseHttpClient error: ${JSON.stringify(err)}`);
                return reject(new ExceptionType(500, err.message));
            });
        });
    }


    /**
     *
     * @param organizationsApps
     * @param service
     */
    public getRequest<T>(
        gocardlessApp: OrganizationAppEntity,
        service: string,
    ): Promise<T> {
        return new Promise(async (resolve, reject) => {
            try {

                const serviceCall = new ServiceCall();
                serviceCall.facility = 'http';
                serviceCall.service = service;
                serviceCall.baseUrl = gocardlessApp.baseUrl; // from the organizations connected apps
                serviceCall.method = 'get';
                serviceCall.headers = {
                    'GoCardless-Version': '2015-07-06',
                    Authorization: 'Bearer ' + gocardlessApp.apiKey,
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
     * @param gocardlessApp
     * @param service
     * @param body
     */
    public postRequest<T>(
        gocardlessApp: OrganizationAppEntity,
        service: string,
        body: any,
    ): Promise<T> {
        return new Promise(async (resolve, reject) => {
            try {

                const serviceCall = new ServiceCall();
                serviceCall.facility = 'http';
                serviceCall.service = service;
                serviceCall.baseUrl = gocardlessApp.baseUrl; // from the organizations connected apps
                serviceCall.method = 'post';
                serviceCall.headers = {
                    'GoCardless-Version': '2015-07-06',
                    Authorization: 'Bearer ' + gocardlessApp.apiKey,
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
     * @param organizationsApps
     * @param service
     * @param body
     */
    public putRequest<T>(
        gocardlessApp: OrganizationAppEntity,
        service: string,
        body: any,
    ): Promise<T> {
        return new Promise(async (resolve, reject) => {
            try {

                const serviceCall = new ServiceCall();
                serviceCall.facility = 'http';
                serviceCall.service = service;
                serviceCall.baseUrl = gocardlessApp.baseUrl; // from the organizations connected apps
                serviceCall.method = 'put';
                serviceCall.headers = {
                    'GoCardless-Version': '2015-07-06',
                    Authorization: 'Bearer ' + gocardlessApp.apiKey,
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
     * @param organizationsApps
     * @param service
     */
    public deleteRequest<T>(
        gocardlessApp: OrganizationAppEntity,
        service: string,
    ): Promise<T> {
        return new Promise(async (resolve, reject) => {
            try {

                const serviceCall = new ServiceCall();
                serviceCall.facility = 'http';
                serviceCall.service = service;
                serviceCall.baseUrl = gocardlessApp.baseUrl; // from the organizations connected apps
                serviceCall.method = 'delete';
                serviceCall.headers = {
                    'GoCardless-Version': '2015-07-06',
                    Authorization: 'Bearer ' + gocardlessApp.apiKey,
                };

                const res = await this.httpRequest<T>(serviceCall);

                return resolve(res);
            } catch (e) {
                return reject(e);
            }
        });
    }

}
