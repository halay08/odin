import { RxHR } from '@akanass/rx-http-request';
import { ServiceCall } from '@d19n/client/dist/client/ServiceCall';
import { ServiceClient } from '@d19n/client/dist/client/ServiceClient';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import * as dotenv from 'dotenv';

dotenv.config();

const baseUrl = process.env.MAGRA_BASE_URL;
console.log('baseUrl', baseUrl);

export class VoiceMagratheaHttpClient {

    public getHeaders() {
        return {
            'Content-Type': 'application/json',
        }
    }

    /**
     *
     * @param service
     */
    public getRequest<T>(
        service: string,
    ): Promise<T> {
        return new Promise(async (resolve, reject) => {
            try {

                const serviceCall = new ServiceCall();
                serviceCall.facility = 'http';
                serviceCall.service = service;
                serviceCall.baseUrl = baseUrl;
                serviceCall.method = 'get';
                serviceCall.headers = this.getHeaders();

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
     */
    public postRequest<T>(
        service: string,
        body: any,
    ): Promise<T> {
        return new Promise(async (resolve, reject) => {
            try {

                const serviceCall = new ServiceCall();
                serviceCall.facility = 'http';
                serviceCall.service = service;
                serviceCall.baseUrl = baseUrl;
                serviceCall.method = 'post';
                serviceCall.headers = this.getHeaders();
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
     */
    public putRequest<T>(
        service: string,
        body: any,
    ): Promise<T> {
        return new Promise(async (resolve, reject) => {
            try {

                const serviceCall = new ServiceCall();
                serviceCall.facility = 'http';
                serviceCall.service = service;
                serviceCall.baseUrl = baseUrl;
                serviceCall.method = 'put';
                serviceCall.headers = this.getHeaders();
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
     */
    public deleteRequest<T>(
        service: string,
    ): Promise<T> {
        return new Promise(async (resolve, reject) => {
            try {

                const serviceCall = new ServiceCall();
                serviceCall.facility = 'http';
                serviceCall.service = service;
                serviceCall.baseUrl = baseUrl;
                serviceCall.method = 'delete';
                serviceCall.headers = this.getHeaders();

                const res = await this.httpRequest<T>(serviceCall);

                return resolve(res);
            } catch (e) {
                return reject(e);
            }
        });
    }

    /**
     *
     * @param serviceCall
     * @private
     */
    private httpRequest<T>(
        serviceCall: ServiceCall,
    ): Promise<any> {
        return new Promise(async (resolve, reject) => {

            const options = {
                headers: serviceCall.headers,
                body: serviceCall.body,
                // rejectUnauthorized: false,
                json: true,
                auth: {
                    username: process.env.MAGRA_USERNAME,
                    password: process.env.MAGRA_PASSWORD,
                },
            };

            console.log('options', options);

            RxHR[serviceCall.method]<any>(`${serviceCall.baseUrl}${serviceCall.service}${serviceCall.params && serviceCall.params.length > 0 ? ServiceClient.getQueryParams(
                serviceCall.params) : ''}`, options).subscribe((data) => {

                console.log('toJSON', data.response.toJSON());

                if(data.response.statusCode === 200) {

                    console.log('data', data);
                    return resolve(data.body);
                } else if(data.response.statusCode === 422) {
                    console.log('error 422', data.body);
                    return reject(data.body);
                } else if(data.response.statusCode === 500) {
                    return reject(new ExceptionType(500, data['error']));
                } else {
                    console.log('uknown', data.body);
                    return reject(data);
                }
            }, (err) => {
                console.error(`BaseHttpClient error: ${JSON.stringify(err)}`);
                return reject(new ExceptionType(500, err.message));
            });
        });
    }

}
