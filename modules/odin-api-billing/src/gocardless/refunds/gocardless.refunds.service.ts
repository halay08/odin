import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationAppTypes } from '@d19n/models/dist/identity/organization/app/organization.app.types';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { changeKeysCamelCaseToSnakeCase, changeKeysSnakeCaseToCamelCase } from '../../helpers/TransformData';
import { BaseHttpClient } from '../Http/BaseHttpClient';
import { GocardlessRefundInterface } from './interfaces/gocardless.refund.interface';
import { GocardlessRefundEntity } from './types/gocardless.refund.entity';
import { GocardlessRefundResponse } from './types/gocardless.refund.response';

const { IDENTITY_MODULE } = SchemaModuleTypeEnums;

@Injectable()
export class GocardlessRefundsService extends BaseHttpClient {

  constructor(private readonly amqpConnection: AmqpConnection) {
    super();
    this.amqpConnection = amqpConnection;
  }

  /**
   *
   * @param principal
   */
  public async listRefunds(principal: OrganizationUserEntity): Promise<any> {
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

        const res = await this.getRequest(orgAppRes.data, 'refunds');
        return resolve(res);
      } catch (e) {

        return reject(new ExceptionType(e.statusCode, e.message, e.validation));
      }
    });
  }

  /**
   *
   * @param principal
   * @param body
   */
  public async createRefund(
    principal: OrganizationUserEntity,
    body: GocardlessRefundEntity,
  ): Promise<GocardlessRefundEntity> {
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

        let parsed = await changeKeysCamelCaseToSnakeCase<GocardlessRefundInterface>(body);
        console.log('parsed', parsed);
        const res = await this.postRequest<GocardlessRefundResponse>(
          orgAppRes.data,
          'refunds',
          { refunds: parsed },
        );
        const parseToCamelCase = changeKeysSnakeCaseToCamelCase<GocardlessRefundEntity>(res.refunds);

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
   * @param refundId
   */
  public async getRefundById(
    principal: OrganizationUserEntity,
    refundId: string,
  ): Promise<GocardlessRefundEntity> {
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

        const res = await this.getRequest<GocardlessRefundResponse>(orgAppRes.data, `refunds/${refundId}`);
        const parseToCamelCase = changeKeysSnakeCaseToCamelCase<GocardlessRefundEntity>(res.refunds);

        return resolve(parseToCamelCase);
      } catch (e) {

        return reject(new ExceptionType(e.statusCode, e.message, e.validation));
      }
    });
  }

  /**
   *
   * @param principal
   * @param refundId
   * @param body
   */
  public async updateRefundById(
    principal: OrganizationUserEntity,
    refundId: string,
    body: GocardlessRefundEntity,
  ): Promise<GocardlessRefundEntity> {
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

        let parsed = await changeKeysCamelCaseToSnakeCase<GocardlessRefundInterface>(body);
        const res = await this.putRequest<GocardlessRefundResponse>(
          orgAppRes.data,
          `refunds/${refundId}`,
          { refunds: parsed },
        );
        const parseToCamelCase = changeKeysSnakeCaseToCamelCase<GocardlessRefundEntity>(res.refunds);

        return resolve(parseToCamelCase);
      } catch (e) {

        return reject(new ExceptionType(e.statusCode, e.message, e.validation));
      }
    });
  }

}
