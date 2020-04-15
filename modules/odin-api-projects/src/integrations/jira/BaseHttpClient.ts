import { ServiceCall } from '@d19n/client/dist/client/ServiceCall';
import { ServiceClient } from '@d19n/client/dist/client/ServiceClient';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationAppEntity } from '@d19n/models/dist/identity/organization/app/organization.app.entity';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

export class BaseHttpClient {


    public async httpRequest<T>(
        serviceCall: ServiceCall,
    ): Promise<T> {
        try {

            const params = {
                method: serviceCall.method,
                timeout: 60 * 1000,
                url: `${serviceCall.baseUrl}/${serviceCall.service}${serviceCall.params && serviceCall.params.length > 0 ? ServiceClient.getQueryParams(
                    serviceCall.params) : ''}`,
                headers: serviceCall.headers,
                data: serviceCall.body,
            }

            if(serviceCall.debug) {
                console.log('params', params);
            }

            const res = await axios(params);

            if(serviceCall.debug) {

                console.log('res');

            }

            return res.data;

        } catch (e) {

            if(serviceCall.debug) {
                console.log(e.toJSON());
            }

            if(e.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                if(serviceCall.debug) {
                    console.log(e.response.data);
                    console.log(e.response.status);
                    console.log(e.response.headers);
                }

                throw new ExceptionType(e.response.status, e.message, e.response.data.validation, e.response.data.data)

            } else if(e.request) {
                // The request was made but no response was received
                // `e.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                if(serviceCall.debug) {
                    console.log(e.request);
                }

                throw new ExceptionType(500, 'the request was made but no response was received')

            } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Error', e.message);

                throw new ExceptionType(500, 'something happened in setting up the request that triggered an Error')

            }

            throw new ExceptionType(500, 'failed to process request')
        }
    }


    /**
     *
     * @param appConnect
     * @param service
     * @param body
     * @param debug
     */
    public getRequest<T>(
        appConnect: OrganizationAppEntity,
        service: string,
        body: any,
        debug?: boolean,
    ): Promise<T> {
        return new Promise(async (resolve, reject) => {
            try {
                const serviceCall = new ServiceCall();
                serviceCall.facility = 'http';
                serviceCall.service = service;
                serviceCall.baseUrl = appConnect.baseUrl;
                serviceCall.method = 'get';
                serviceCall.headers = {
                    Authorization: 'Basic ' + Buffer.from(appConnect.apiKey).toString('base64'),
                };
                serviceCall.debug = debug;

                const res = await this.httpRequest<T>(serviceCall);

                return resolve(res);
            } catch (e) {
                return reject(e);
            }
        });
    }

    /**
     *
     * @param appConnect
     * @param service
     * @param body
     * @param debug
     */
    public async postRequest<T>(
        appConnect: OrganizationAppEntity,
        service: string,
        body: any,
        debug?: boolean,
    ): Promise<T> {
        try {
            const serviceCall = new ServiceCall();
            serviceCall.facility = 'http';
            serviceCall.service = service;
            serviceCall.baseUrl = appConnect.baseUrl;
            serviceCall.method = 'post';
            serviceCall.headers = {
                Authorization: 'Basic ' + Buffer.from(appConnect.apiKey).toString('base64'),
            };
            serviceCall.body = body;
            serviceCall.debug = debug;

            const res = await this.httpRequest<T>(serviceCall);

            return res;

        } catch (e) {
            return e;
        }
    }

    /**
     *
     * @param baseUrl
     * @param service
     * @param base64Token
     * @param body
     * @param debug
     */
    public putRequest<T>(
        appConnect: OrganizationAppEntity,
        service: string,
        body: any,
        debug?: boolean,
    ): Promise<T> {
        return new Promise(async (resolve, reject) => {
            try {

                const serviceCall = new ServiceCall();
                serviceCall.facility = 'http';
                serviceCall.service = service;
                serviceCall.baseUrl = appConnect.baseUrl;
                serviceCall.method = 'put';
                serviceCall.headers = {
                    Authorization: 'Basic ' + Buffer.from(appConnect.apiKey).toString('base64'),
                };
                serviceCall.body = body;
                serviceCall.debug = debug;

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
     * @param base64Token
     */
    public deleteRequest<T>(
        appConnect: OrganizationAppEntity,
        service: string,
    ): Promise<T> {
        return new Promise(async (resolve, reject) => {
            try {
                const serviceCall = new ServiceCall();
                serviceCall.facility = 'http';
                serviceCall.service = service;
                serviceCall.baseUrl = appConnect.baseUrl;
                serviceCall.method = 'delete';
                serviceCall.headers = {
                    Authorization: 'Basic ' + Buffer.from(appConnect.apiKey).toString('base64'),
                };

                const res = await this.httpRequest<T>(serviceCall);

                return resolve(res);
            } catch (e) {
                return reject(e);
            }
        });
    }

}
