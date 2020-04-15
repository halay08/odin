import { RxHR } from '@akanass/rx-http-request';
import axios from 'axios';
import { Observable, of, Subject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Param } from './Param';
import { ServiceCall } from './ServiceCall';
import { ServiceResponse } from './ServiceResponse';

/**
 * API client for microservice communicaiton.
 */
export class ServiceClient {

    /**
     * Coverts an array of {Param} to a string like key1=value&key2=value.
     *
     * @param {Array<Param>} params
     * @returns {string}
     */
    public static getQueryParams(params: Array<Param>): string {
        const build = [];
        params.forEach(param => build.push(`${param.name}=${param.value}`));
        return build.join('&');
    }

    /**
     * Perform an api call.
     *
     * @param {ServiceCall} serviceCall
     * @returns {Observable<T>}
     */
    public static call<T>(serviceCall: ServiceCall): Observable<ServiceResponse<T>> {

        if(serviceCall.facility === 'http') {

            if(serviceCall.debug) {
                console.log(serviceCall);
            }
            const subject: Subject<ServiceResponse<T>> = new Subject();
            const options = {
                timeout: 10000,
                headers: serviceCall.headers,
                body: serviceCall.body,
                json: true,
                pool: {
                    maxSockets: 100,
                },
            };
            RxHR[serviceCall.method]<T>(`${serviceCall.baseUrl}/${serviceCall.service}${serviceCall.params && serviceCall.params.length > 0 ? ServiceClient.getQueryParams(
                serviceCall.params) : ''}`, options).pipe(catchError(e => {
                // Handle network errors (before subscribe is called).
                subject.next({
                    code: 502,
                    message: `failed to connect to service: ${e.code}`,
                    response: null,
                    successful: false,
                    facility: 'http',
                });
                return of(null);
            })).subscribe((data) => {
                if(serviceCall.debug) {
                    console.log(data);
                }
                if(!!data) {
                    subject.next({
                        code: data.response.statusCode,
                        message: data.response.statusMessage,
                        response: data.response.body as T,
                        successful: data.response.statusCode >= 200 && data.response.statusCode < 300,
                        facility: 'http',
                    });
                } else {
                    if(serviceCall.debug) {
                        console.error(`No data returned from service: ${serviceCall.service} using: ${serviceCall.facility} baseurl: ${serviceCall.baseUrl}`);
                    }
                    throw `No data returned from service: ${serviceCall.service} using: ${serviceCall.facility} baseurl: ${serviceCall.baseUrl}`;
                }
            }, (err) => {
                if(serviceCall.debug) {
                    console.error(`ServiceClient.call() error: ${JSON.stringify(err)}`);
                }
                throw err;
            });
            return subject;
        } else if(serviceCall.facility === 'amqp') {
            // rabbit mq
            throw `${serviceCall.facility} not implemented yet!`;
        } else {
            throw `${serviceCall.facility} not implemented yet!`;
        }
    }


    /**
     * New 2021 switching to axios
     * Perform an api call using axios
     *
     * @param {ServiceCall} serviceCall
     * @returns {Observable<T>}
     */
    public static async callAxios<T>(serviceCall: ServiceCall): Promise<ServiceResponse<T>> {

        if(serviceCall.facility === 'http') {

            if(serviceCall.debug) {
                console.log(serviceCall);
            }

            const url = `${serviceCall.baseUrl}/${serviceCall.service}`;

            const res = await axios({
                method: serviceCall.method,
                url,
                data: serviceCall.body,
                headers: serviceCall.headers,
                params: serviceCall.params,
            });

            if(serviceCall.debug) {
                console.log('res', res);
            }

            if(!res && !res.data) {
                return {
                    code: 502,
                    message: `failed to connect to service ${serviceCall.method} ${url}`,
                    response: null,
                    successful: false,
                    facility: 'http',
                }
            }

            return {
                code: res.data.data.statusCode,
                message: res.data.data.statusMessage,
                response: res.data.data as T,
                successful: res.data.data.statusCode >= 200 && res.data.datastatusCode < 300,
                facility: 'http',
            }

        } else if(serviceCall.facility === 'amqp') {
            // rabbit mq
            throw `${serviceCall.facility} not implemented yet!`;
        } else {
            throw `${serviceCall.facility} not implemented yet!`;
        }
    }
}
