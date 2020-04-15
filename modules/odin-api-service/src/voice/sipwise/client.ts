import { RxHR } from '@akanass/rx-http-request';
import { ServiceCall } from '@d19n/client/dist/client/ServiceCall';
import { ServiceClient } from '@d19n/client/dist/client/ServiceClient';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import * as dotenv from 'dotenv';

dotenv.config();

const baseUrl = process.env.SIPWISE_BASE_URL;
console.log('baseUrl', baseUrl);

export class VoiceSipwiseHttpClient {

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
     * @param body
     */
    public patchRequest<T>(
        service: string,
        body: any,
    ): Promise<T> {
        return new Promise(async (resolve, reject) => {
            try {

                const serviceCall = new ServiceCall();
                serviceCall.facility = 'http';
                serviceCall.service = service;
                serviceCall.baseUrl = baseUrl;
                serviceCall.method = 'patch';
                serviceCall.headers = {
                    'Content-Type': 'application/json-patch+json',
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
                // cert: fs.readFileSync(__dirname + '/NGCP-API-client-certificate-1594711959.pem'),
                rejectUnauthorized: false,
                json: true,
                auth: {
                    username: process.env.SIPWISE_USERNAME,
                    password: process.env.SIPWISE_PASSWORD,
                },
            };

            RxHR[serviceCall.method]<any>(`${serviceCall.baseUrl}${serviceCall.service}${serviceCall.params && serviceCall.params.length > 0 ? ServiceClient.getQueryParams(
                serviceCall.params) : ''}`, options).subscribe((data) => {

                console.log('datares', data.response.toJSON());
                console.log('dataresCode', data.response.statusCode);

                // item created
                if(data.response.statusCode === 201) {
                    // when creating a new item the new item path is returned as a location param
                    // in the response header
                    const locationSplit = data.response.headers.location.split('/');
                    const locationId = locationSplit[3];
                    return resolve({
                        id: locationId,
                    });
                }

                if(data.response.statusCode === 200) {
                    // response for list views
                    if(data.response.body && data.response.body['_embedded']) {
                        return resolve(data.response.body['_embedded']);
                    } else {
                        // response for getting single items
                        // when deleting a contact we get back a 200 with no body
                        return resolve(data.response.body || data.response.request.method);
                    }
                } else if(data.response.statusCode === 204) {
                    // 204 is success from sipwise but no data is returned
                    // so just return the body passed in
                    // when terminating a customer we get back a 204 with an _embedded
                    if(data.response.body && data.response.body['_embedded']) {

                        return resolve(data.response.body['_embedded']);

                    } else {
                        return resolve(serviceCall.body || data.response.request.method);
                    }
                } else if(data.response.statusCode === 422) {
                    console.log('error 422', data.response.body);
                    return reject(data.response.body);
                } else {
                    console.log('error uknown', data.response.body);
                    return reject(data.response.body);
                }
            }, (err) => {
                console.error(`BaseHttpClient error: ${JSON.stringify(err)}`);
                return reject(new ExceptionType(err.code, err.message));
            });
        });
    }

}
