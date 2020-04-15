import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { QueriesService } from './queries.service';
import { IRecordQuery } from './types/queries.standard.interface';

interface IRunSqlQuery {
    principal: OrganizationUserEntity,
    query: IRecordQuery
}


const RPC_RUN_SQL_QUERY = 'RpcRunSqlQuery';

dotenv.config();

@Injectable()
export class QueriesRabbitmqHandler {

    constructor(private readonly queriesService: QueriesService) {

        this.queriesService = queriesService;
    }

    /**
     *  Handle projects created
     * @param msg
     * @private
     */
    @RabbitRPC({
        exchange: process.env.MODULE_NAME,
        routingKey: `${process.env.MODULE_NAME}.${RPC_RUN_SQL_QUERY}`,
        queue: `${process.env.MODULE_NAME}.${RPC_RUN_SQL_QUERY}`,
    })
    private async executeSQLQuery(msg: IRunSqlQuery) {
        try {
            // Handle message
            const res = await this.queriesService.runQueryByPrincipalAndName(msg.principal, msg.query);

            return {
                statusCode: 200,
                message: 'success',
                data: res,
            };
        } catch (e) {
            console.error(e);
            return {
                statusCode: e.statusCode,
                message: e.message,
                data: undefined,
            }
        }
    }

}
