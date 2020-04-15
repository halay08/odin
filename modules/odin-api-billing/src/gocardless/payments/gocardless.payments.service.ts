import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationAppTypes } from '@d19n/models/dist/identity/organization/app/organization.app.types';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { changeKeysCamelCaseToSnakeCase, changeKeysSnakeCaseToCamelCase } from '../../helpers/TransformData';
import { BaseHttpClient } from '../Http/BaseHttpClient';
import { GocardlessPaymentInterface } from './interfaces/gocardless.payment.interface';
import { GocardlessPaymentEntity } from './types/gocardless.payment.entity';
import { GocardlessPaymentResponse } from './types/gocardless.payment.response';

const { IDENTITY_MODULE } = SchemaModuleTypeEnums;

@Injectable()
export class GocardlessPaymentsService extends BaseHttpClient {

  constructor(private readonly amqpConnection: AmqpConnection) {
    super();
    this.amqpConnection = amqpConnection;
  }

  /**
   *
   * @param principal
   * @param headers
   */
  public async listPayments(principal: OrganizationUserEntity): Promise<any> {
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

        const res = await this.getRequest(orgAppRes.data, 'payments');
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
  public async createPayment(
    principal: OrganizationUserEntity,
    body: GocardlessPaymentEntity,
  ): Promise<GocardlessPaymentEntity> {
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

        let parsed = await changeKeysCamelCaseToSnakeCase<GocardlessPaymentInterface>(body);
        console.log('parsed', parsed);
        const res = await this.postRequest<GocardlessPaymentResponse>(
          orgAppRes.data,
          'payments',
          { payments: parsed },
        );
        const parseToCamelCase = changeKeysSnakeCaseToCamelCase<GocardlessPaymentEntity>(res.payments);

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
   * @param paymentId
   * @param paymentId
   */
  public async getPaymentById(
    principal: OrganizationUserEntity,
    paymentId: string,
  ): Promise<GocardlessPaymentEntity> {
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

        const res = await this.getRequest<GocardlessPaymentResponse>(orgAppRes.data, `payments/${paymentId}`);
        const parseToCamelCase = changeKeysSnakeCaseToCamelCase<GocardlessPaymentEntity>(res.payments);

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
   * @param paymentId
   * @param body
   */
  public async updatePaymentById(
    principal: OrganizationUserEntity,
    paymentId: string,
    body: GocardlessPaymentEntity,
  ): Promise<GocardlessPaymentEntity> {
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

        let parsed = await changeKeysCamelCaseToSnakeCase<GocardlessPaymentInterface>(body);
        const res = await this.putRequest<GocardlessPaymentResponse>(
          orgAppRes.data,
          `payments/${paymentId}`,
          { payments: parsed },
        );
        const parseToCamelCase = changeKeysSnakeCaseToCamelCase<GocardlessPaymentEntity>(res.payments);

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
   * @param paymentId
   */
  public async cancelPaymentById(
    principal: OrganizationUserEntity,
    paymentId: string,
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

        const res = await this.postRequest<GocardlessPaymentResponse>(
          orgAppRes.data,
          `payments/${paymentId}/actions/cancel`,
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
   * @param paymentId
   */
  public async retryPaymentById(
    principal: OrganizationUserEntity,
    paymentId: string,
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

        const res = await this.postRequest<GocardlessPaymentResponse>(
          orgAppRes.data,
          `payments/${paymentId}/actions/retry`,
          {},
        );

        return resolve(res);
      } catch (e) {

        return reject(new ExceptionType(e.statusCode, e.message, e.validation));
      }
    });
  }

}
