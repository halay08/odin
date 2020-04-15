import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationAppTypes } from '@d19n/models/dist/identity/organization/app/organization.app.types';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { RPC_GET_ORG_APP_BY_NAME } from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { changeKeysCamelCaseToSnakeCase, changeKeysSnakeCaseToCamelCase } from '../../helpers/TransformData';
import { BaseHttpClient } from '../Http/BaseHttpClient';
import { GocardlessCustomerInterface } from './interfaces/gocardless.customer.interface';
import { GocardlessCustomerEntity } from './types/gocardless.customer.entity';
import { GocardlessCustomerResponse } from './types/gocardless.customer.response';

const { IDENTITY_MODULE } = SchemaModuleTypeEnums;

@Injectable()
export class GocardlessCustomersService extends BaseHttpClient {

    constructor(private readonly amqpConnection: AmqpConnection) {
        super();
        this.amqpConnection = amqpConnection;
    }


    /**
     *
     * @param principal
     * @param headers
     */
    public async listCustomers(principal: OrganizationUserEntity): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                const orgAppRes = await this.amqpConnection.request<any>({
                    exchange: IDENTITY_MODULE,
                    routingKey: `${IDENTITY_MODULE}.${RPC_GET_ORG_APP_BY_NAME}`,
                    payload: {
                        principal,
                        name: OrganizationAppTypes.GOCARDLESS,
                    },
                    timeout: 10000,
                });

                const res = await this.getRequest(orgAppRes.data, 'customers');

                return resolve(res);
            } catch (e) {
                return reject(new ExceptionType(e.statusCode, e.message, e.validation));
            }
        });
    }

    /**
     *
     * @param principal
     * @param headers
     * @param body
     */
    public async createCustomer(
        principal: OrganizationUserEntity,
        body: GocardlessCustomerEntity,
    ): Promise<GocardlessCustomerEntity> {
        return new Promise(async (resolve, reject) => {
            try {
                const orgAppRes = await this.amqpConnection.request<any>({
                    exchange: IDENTITY_MODULE,
                    routingKey: `${IDENTITY_MODULE}.${RPC_GET_ORG_APP_BY_NAME}`,
                    payload: {
                        principal,
                        name: OrganizationAppTypes.GOCARDLESS,
                    },
                    timeout: 10000,
                });

                let parsed = await changeKeysCamelCaseToSnakeCase<GocardlessCustomerInterface>(body);
                const res = await this.postRequest<GocardlessCustomerResponse>(
                    orgAppRes.data,
                    'customers',
                    { customers: parsed },
                );
                const parseToCamelCase = changeKeysSnakeCaseToCamelCase<GocardlessCustomerEntity>(res.customers);

                return resolve(parseToCamelCase);
            } catch (e) {

                return reject(new ExceptionType(e.statusCode, e.message, e.validation));
            }
        });
    }

    /**
     *
     * @param principal
     * @param headers
     * @param customerId
     */
    public async getCustomerById(
        principal: OrganizationUserEntity,
        customerId: string,
    ): Promise<GocardlessCustomerEntity> {
        return new Promise(async (resolve, reject) => {
            try {
                const orgAppRes = await this.amqpConnection.request<any>({
                    exchange: IDENTITY_MODULE,
                    routingKey: `${IDENTITY_MODULE}.${RPC_GET_ORG_APP_BY_NAME}`,
                    payload: {
                        principal,
                        name: OrganizationAppTypes.GOCARDLESS,
                    },
                    timeout: 10000,
                });

                const res = await this.getRequest<GocardlessCustomerResponse>(
                    orgAppRes.data,
                    `customers/${customerId}`,
                );
                const parseToCamelCase = changeKeysSnakeCaseToCamelCase<GocardlessCustomerEntity>(res.customers);

                return resolve(parseToCamelCase);
            } catch (e) {

                return reject(new ExceptionType(e.statusCode, e.message, e.validation));
            }
        });
    }

    /**
     *
     * @param principal
     * @param headers
     * @param customerId
     * @param body
     */
    public async updateCustomerById(
        principal: OrganizationUserEntity,
        customerId: string,
        body: GocardlessCustomerEntity,
    ): Promise<GocardlessCustomerEntity> {
        return new Promise(async (resolve, reject) => {
            try {

                const orgAppRes = await this.amqpConnection.request<any>({
                    exchange: IDENTITY_MODULE,
                    routingKey: `${IDENTITY_MODULE}.${RPC_GET_ORG_APP_BY_NAME}`,
                    payload: {
                        principal,
                        name: OrganizationAppTypes.GOCARDLESS,
                    },
                    timeout: 10000,
                });

                let parsed = await changeKeysCamelCaseToSnakeCase<GocardlessCustomerInterface>(body);
                const res = await this.putRequest<GocardlessCustomerResponse>(
                    orgAppRes.data,
                    `customers/${customerId}`,
                    { customers: parsed },
                );
                const parseToCamelCase = changeKeysSnakeCaseToCamelCase<GocardlessCustomerEntity>(res.customers);

                return resolve(parseToCamelCase);
            } catch (e) {

                return reject(new ExceptionType(e.statusCode, e.message, e.validation));
            }
        });
    }


    /**
     *
     * @param principal
     * @param headers
     * @param customerId
     */
    public async deleteCustomerById(
        principal: OrganizationUserEntity,
        customerId: string,
    ): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                const orgAppRes = await this.amqpConnection.request<any>({
                    exchange: IDENTITY_MODULE,
                    routingKey: `${IDENTITY_MODULE}.${RPC_GET_ORG_APP_BY_NAME}`,
                    payload: {
                        principal,
                        name: OrganizationAppTypes.GOCARDLESS,
                    },
                    timeout: 10000,
                });

                const res = await this.deleteRequest<GocardlessCustomerResponse>(
                    orgAppRes.data,
                    `customers/${customerId}`,
                );

                return resolve(res);
            } catch (e) {
                return reject(new ExceptionType(e.statusCode, e.message, e.validation));
            }
        })
    }

}
