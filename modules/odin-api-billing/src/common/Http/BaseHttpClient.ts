import * as dotenv from 'dotenv';
import { RxHR } from "@akanass/rx-http-request";
import { ExceptionType } from "@d19n/common/dist/exceptions/types/ExceptionType";
import { ServiceCall } from "@d19n/client/dist/client/ServiceCall";
import { ServiceClient } from "@d19n/client/dist/client/ServiceClient";
import { OrganizationAppEntity } from "@d19n/models/dist/identity/organization/app/organization.app.entity";
import { OrganizationAppTypes } from "@d19n/models/dist/identity/organization/app/organization.app.types";

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
            RxHR[serviceCall.method]<T>(`${serviceCall.baseUrl}/${serviceCall.service}${serviceCall.params && serviceCall.params.length > 0 ? ServiceClient.getQueryParams(serviceCall.params) : ''}`, options).subscribe((data) => {
                return resolve(data.body);
            }, (err) => {
                console.error(`BaseHttpClient error: ${JSON.stringify(err)}`);
                return reject(new ExceptionType(500, err.message));
            });
        });
    }


    /**
     *
     * @param service
     * @param baseUrl
     * @param jwtToken
     */
    public getRequest<T>(
        baseUrl: string,
        service: string,
        jwtToken: string,
    ): Promise<T> {
        return new Promise(async (resolve, reject) => {
            try {
                const serviceCall = new ServiceCall();
                serviceCall.facility = 'http';
                serviceCall.service = service;
                serviceCall.baseUrl = baseUrl; // from the organizations connected apps
                serviceCall.method = 'get';
                serviceCall.headers = {
                    Authorization: 'Bearer ' + jwtToken,
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
        baseUrl: string,
        service: string,
        jwtToken: string,
        body: any,
    ): Promise<T> {
        return new Promise(async (resolve, reject) => {
            try {

                const serviceCall = new ServiceCall();
                serviceCall.facility = 'http';
                serviceCall.service = service;
                serviceCall.baseUrl = baseUrl;
                serviceCall.method = 'post';
                serviceCall.headers = {
                    Authorization: 'Bearer ' + jwtToken,
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
        baseUrl: string,
        service: string,
        jwtToken: string,
        body: any,
    ): Promise<T> {
        return new Promise(async (resolve, reject) => {
            try {

                const serviceCall = new ServiceCall();
                serviceCall.facility = 'http';
                serviceCall.service = service;
                serviceCall.baseUrl = baseUrl;
                serviceCall.method = 'put';
                serviceCall.headers = {
                    Authorization: 'Bearer ' + jwtToken,
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
        organizationsApps: OrganizationAppEntity[],
        service: string,
    ): Promise<T> {
        return new Promise(async (resolve, reject) => {
            try {
                let app: OrganizationAppTypes;
                app = OrganizationAppTypes.GOCARDLESS;

                const gocardlessApp = organizationsApps.find(elem => elem.name === app);

                const serviceCall = new ServiceCall();
                serviceCall.facility = 'http';
                serviceCall.service = service;
                serviceCall.baseUrl = gocardlessApp.baseUrl; // from the organizations connected apps
                serviceCall.method = 'delete';
                serviceCall.headers = {
                    'GoCardless-Version': "2015-07-06",
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
