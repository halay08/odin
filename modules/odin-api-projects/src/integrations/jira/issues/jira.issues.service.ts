import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationAppEntity } from '@d19n/models/dist/identity/organization/app/organization.app.entity';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { RPC_GET_ORG_APP_BY_NAME } from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { BaseHttpClient } from '../BaseHttpClient';
import { JiraIssueCreateDto } from './dto/jira.issue.create.dto';
import { JiraIssueCreateResponse } from './interface/issues.create.response';

const { IDENTITY_MODULE } = SchemaModuleTypeEnums;


@Injectable()
export class JiraIssuesService extends BaseHttpClient {

    constructor(private readonly amqpConnection: AmqpConnection) {
        super();
        this.amqpConnection = amqpConnection;
    }


    /**
     *
     * @param principal
     * @param recordId
     * @param body
     */
    public async createIssue(
        principal: OrganizationUserEntity,
        body: JiraIssueCreateDto,
    ): Promise<JiraIssueCreateResponse> {

        try {

            const appConnect = await this.initializeApp(principal);

            if(appConnect) {
                const res = await this.postRequest<any>(
                    appConnect,
                    'issue',
                    body,
                    true,
                );

                return res;
            }

            return undefined;

        } catch (e) {

            console.error(e);
            throw new ExceptionType(e.stausCode, e.message);

        }

    }


    /**
     *
     * @param principal
     * @private
     */
    private async initializeApp(principal: OrganizationUserEntity): Promise<OrganizationAppEntity> {
        const orgAppRes = await this.amqpConnection.request<any>({
            exchange: IDENTITY_MODULE,
            routingKey: `${IDENTITY_MODULE}.${RPC_GET_ORG_APP_BY_NAME}`,
            payload: {
                principal,
                name: 'JIRA',
            },
            timeout: 10000,
        });

        return orgAppRes.data;
    }
}
