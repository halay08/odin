import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationAppTypes } from '@d19n/models/dist/identity/organization/app/organization.app.types';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { changeKeysCamelCaseToSnakeCase, changeKeysSnakeCaseToCamelCase } from '../../../../helpers/TransformData';
import { BaseHttpClient } from '../../../Http/BaseHttpClient';
import { GocardlessCustomerBankAccountInterface } from './interfaces/gocardless.customer.bank.account.interface';
import { GocardlessCustomerBankAccountEntity } from './types/gocardless.customer.bank.account.entity';
import { GocardlessCustomerBankAccountResponse } from './types/gocardless.customer.bank.account.response';

const { IDENTITY_MODULE } = SchemaModuleTypeEnums;

@Injectable()
export class GocardlessCustomersBankAccountsService extends BaseHttpClient {

    constructor(private readonly amqpConnection: AmqpConnection) {
        super();
        this.amqpConnection = amqpConnection;

    }

    /**
     *
     * @param principal
     * @param headers
     */
    public async listCustomerBankAccounts(principal: OrganizationUserEntity): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                const orgAppRes = await this.amqpConnection.request<any>({
                    exchange: IDENTITY_MODULE,
                    routingKey: `${IDENTITY_MODULE}.RpcGetOrgAppByName`,
                    payload: {
                        principal,
                        name: OrganizationAppTypes.GOCARDLESS,
                    },
                    timeout: 10000,
                });

                const res = await this.getRequest(orgAppRes.data, 'customer_bank_accounts');

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
    public async createCustomerBankAccount(
        principal: OrganizationUserEntity,
        body: GocardlessCustomerBankAccountEntity,
    ): Promise<GocardlessCustomerBankAccountEntity> {
        return new Promise(async (resolve, reject) => {
            try {
                const orgAppRes = await this.amqpConnection.request<any>({
                    exchange: IDENTITY_MODULE,
                    routingKey: `${IDENTITY_MODULE}.RpcGetOrgAppByName`,
                    payload: {
                        principal,
                        name: OrganizationAppTypes.GOCARDLESS,
                    },
                    timeout: 10000,
                });

                let parsed = await changeKeysCamelCaseToSnakeCase<GocardlessCustomerBankAccountInterface>(body);
                const res = await this.postRequest<GocardlessCustomerBankAccountResponse>(
                    orgAppRes.data,
                    'customer_bank_accounts',
                    { customer_bank_accounts: parsed },
                );
                const parseToCamelCase = changeKeysSnakeCaseToCamelCase<GocardlessCustomerBankAccountEntity>(res.customer_bank_accounts);

                return resolve(parseToCamelCase);
            } catch (e) {
                console.error('create customer bank account', e);
                return reject(new ExceptionType(e.statusCode, e.message, e.validation, e.data));
            }
        });
    }


    /**
     *
     * @param principal
     * @param headers
     * @param bankAccountId
     */
    public async getCustomerBankAccountById(
        principal: OrganizationUserEntity,
        bankAccountId: string,
    ): Promise<GocardlessCustomerBankAccountEntity> {
        return new Promise(async (resolve, reject) => {
            try {
                const orgAppRes = await this.amqpConnection.request<any>({
                    exchange: IDENTITY_MODULE,
                    routingKey: `${IDENTITY_MODULE}.RpcGetOrgAppByName`,
                    payload: {
                        principal,
                        name: OrganizationAppTypes.GOCARDLESS,
                    },
                    timeout: 10000,
                });

                const res = await this.getRequest<GocardlessCustomerBankAccountResponse>(
                    orgAppRes.data,
                    `customer_bank_accounts/${bankAccountId}`,
                );
                const parseToCamelCase = changeKeysSnakeCaseToCamelCase<GocardlessCustomerBankAccountEntity>(res.customer_bank_accounts);

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
     * @param bankAccountId
     * @param body
     */
    public async updateCustomerBankAccountById(
        principal: OrganizationUserEntity,
        bankAccountId: string,
        body: GocardlessCustomerBankAccountEntity,
    ): Promise<GocardlessCustomerBankAccountEntity> {
        return new Promise(async (resolve, reject) => {
            try {
                const orgAppRes = await this.amqpConnection.request<any>({
                    exchange: IDENTITY_MODULE,
                    routingKey: `${IDENTITY_MODULE}.RpcGetOrgAppByName`,
                    payload: {
                        principal,
                        name: OrganizationAppTypes.GOCARDLESS,
                    },
                    timeout: 10000,
                });

                let parsed = await changeKeysCamelCaseToSnakeCase<GocardlessCustomerBankAccountInterface>(body);
                const res = await this.putRequest<GocardlessCustomerBankAccountResponse>(
                    orgAppRes.data,
                    `customer_bank_accounts/${bankAccountId}`,
                    { customer_bank_accounts: parsed },
                );
                const parseToCamelCase = changeKeysSnakeCaseToCamelCase<GocardlessCustomerBankAccountEntity>(res.customer_bank_accounts);

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
     * @param bankAccountId
     */
    public async disableCustomerBankAccountById(
        principal: OrganizationUserEntity,
        bankAccountId: string,
    ): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                const orgAppRes = await this.amqpConnection.request<any>({
                    exchange: IDENTITY_MODULE,
                    routingKey: `${IDENTITY_MODULE}.RpcGetOrgAppByName`,
                    payload: {
                        principal,
                        name: OrganizationAppTypes.GOCARDLESS,
                    },
                    timeout: 10000,
                });

                const res = await this.postRequest<GocardlessCustomerBankAccountResponse>(
                    orgAppRes.data,
                    `customer_bank_accounts/${bankAccountId}/actions/disable`,
                    {},
                );

                return resolve(res)
            } catch (e) {

                return reject(new ExceptionType(e.statusCode, e.message, e.validation));
            }
        });
    }

}
