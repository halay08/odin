import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationAppTypes } from '@d19n/models/dist/identity/organization/app/organization.app.types';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { changeKeysCamelCaseToSnakeCase, changeKeysSnakeCaseToCamelCase } from '../../../helpers/TransformData';
import { BaseHttpClient } from '../../Http/BaseHttpClient';
import { GocardlessCustomerMandateInterface } from './interfaces/gocardless.customer.mandate.interface';
import { GocardlessCustomerMandateEntity } from './types/gocardless.customer.mandate.entity';
import { GocardlessCustomerMandateResponse } from './types/gocardless.customer.mandate.response';

const { IDENTITY_MODULE } = SchemaModuleTypeEnums;

@Injectable()
export class GocardlessCustomersMandatesService extends BaseHttpClient {


  constructor(private readonly amqpConnection: AmqpConnection) {
    super();
    this.amqpConnection = amqpConnection;
  }

  /**
   *
   * @param principal
   * @param headers
   */
  public async listCustomerMandates(principal: OrganizationUserEntity): Promise<any> {
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

        const res = await this.getRequest(orgAppRes.data, 'mandates');
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
  public async createCustomerMandate(
    principal: OrganizationUserEntity,
    body: GocardlessCustomerMandateEntity,
  ): Promise<GocardlessCustomerMandateEntity> {
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

        let parsed = await changeKeysCamelCaseToSnakeCase<GocardlessCustomerMandateInterface>(body);
        const res = await this.postRequest<GocardlessCustomerMandateResponse>(
          orgAppRes.data,
          'mandates',
          { mandates: parsed },
        );
        const parseToCamelCase = changeKeysSnakeCaseToCamelCase<GocardlessCustomerMandateEntity>(res.mandates);

        return resolve(parseToCamelCase);
      } catch (e) {
        console.error('create customer mandate', e);
        return reject(new ExceptionType(e.statusCode, e.message, e.validation, e.data));
      }
    });
  }


  /**
   *
   * @param principal
   * @param headers
   * @param mandateId
   */
  public async getCustomerMandateById(
    principal: OrganizationUserEntity,
    mandateId: string,
  ): Promise<GocardlessCustomerMandateEntity> {
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

        const res = await this.getRequest<GocardlessCustomerMandateResponse>(
          orgAppRes.data,
          `mandates/${mandateId}`,
        );
        const parseToCamelCase = changeKeysSnakeCaseToCamelCase<GocardlessCustomerMandateEntity>(res.mandates);

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
   * @param mandateId
   * @param body
   */
  public async updateCustomerMandateById(
    principal: OrganizationUserEntity,
    mandateId: string,
    body: GocardlessCustomerMandateEntity,
  ): Promise<GocardlessCustomerMandateEntity> {
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

        let parsed = await changeKeysCamelCaseToSnakeCase<GocardlessCustomerMandateInterface>(body);
        const res = await this.putRequest<GocardlessCustomerMandateResponse>(
          orgAppRes.data,
          `mandates/${mandateId}`,
          { mandates: parsed },
        );
        const parseToCamelCase = changeKeysSnakeCaseToCamelCase<GocardlessCustomerMandateEntity>(res.mandates);

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
   * @param mandateId
   */
  public async cancelCustomerMandateById(
    principal: OrganizationUserEntity,
    mandateId: string,
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

        const res = await this.postRequest<GocardlessCustomerMandateResponse>(
          orgAppRes.data,
          `mandates/${mandateId}/actions/cancel`,
          {},
        );

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
   * @param mandateId
   */
  public async reinstateCustomerMandateById(
    principal: OrganizationUserEntity,
    mandateId: string,
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

        const res = await this.postRequest<GocardlessCustomerMandateResponse>(
          orgAppRes.data,
          `mandates/${mandateId}/actions/reinstate`,
          {},
        );

        return resolve(res);
      } catch (e) {

        return reject(new ExceptionType(e.statusCode, e.message, e.validation));
      }
    });
  }

}
