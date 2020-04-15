import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { ServiceCall } from '../client/ServiceCall';
import { ServiceClient } from '../client/ServiceClient';

export class APIClient {
    constructor() {
    }

    /**
     * The base Service Call
     * @param serviceCall
     */
    public static async call<T>(serviceCall: ServiceCall): Promise<T> {

        return new Promise(async (resolve, reject) => {
            await ServiceClient.call<ApiResponseType<T>>({
                facility: serviceCall.facility || 'http',
                service: serviceCall.service,
                baseUrl: serviceCall.baseUrl,
                method: serviceCall.method,
                headers: serviceCall.headers,
                body: serviceCall.body,
                debug: serviceCall.debug ? serviceCall.debug : false,
            }).subscribe(results => {
                if(!results.successful) {
                    if(!!results.response) {
                        return reject(new ExceptionType(
                            results.response['statusCode'],
                            results.response['message'],
                            results.response['validation'],
                        ));
                    } else {
                        console.log('results', results);
                        return reject(new ExceptionType(500, 'no response from the service'));
                    }
                }
                return resolve(results.response.data);
            }, (err) => {
                return reject(err);
            });
        });
    }
}
