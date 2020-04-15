import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationAppTypes } from '@d19n/models/dist/identity/organization/app/organization.app.types';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { changeKeysCamelCaseToSnakeCase, changeKeysSnakeCaseToCamelCase } from '../../helpers/TransformData';
import { GocardlessCustomerBankAccountInterface } from '../customers/bank/accounts/interfaces/gocardless.customer.bank.account.interface';
import { BaseHttpClient } from '../Http/BaseHttpClient';
import { GocardlessBankLookupEntity } from './types/gocardless.bank.lookup.entity';
import { GocardlessBankLookupResponse } from './types/gocardless.bank.lookup.response';


const { IDENTITY_MODULE } = SchemaModuleTypeEnums;

@Injectable()
export class GocardlessBankLookupService extends BaseHttpClient {

    constructor(private readonly amqpConnection: AmqpConnection) {
        super();
        this.amqpConnection = amqpConnection;
    }

    /**
     *
     * @param principal
     * @param headers
     * @param body
     */
    public async lookUpBankDetails(
        principal: OrganizationUserEntity,
        body: GocardlessBankLookupEntity,
    ): Promise<GocardlessBankLookupEntity> {
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

                const res = await this.postRequest<GocardlessBankLookupResponse>(
                    orgAppRes.data,
                    'bank_details_lookups',
                    { bank_details_lookups: parsed },
                );

                const parseToCamelCase = changeKeysSnakeCaseToCamelCase<GocardlessBankLookupEntity>(res.bank_details_lookups);

                return resolve(parseToCamelCase);
            } catch (e) {

                return reject(new ExceptionType(500, e.message, e.validation));
            }
        });
    }
}
