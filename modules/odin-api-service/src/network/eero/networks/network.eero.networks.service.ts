import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { RPC_GET_ORG_APP_BY_NAME } from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { EeroHttpClient } from '../EeroHttpClient';
import { IUpdateEeroNetwork } from './interfaces/eero.networks.interfaces';
import { EeroNetworkEntity } from './types/eero.networks.types';


const { IDENTITY_MODULE } = SchemaModuleTypeEnums;


@Injectable()
export class NetworkEeroNetworksService {

    private amqpConnection: AmqpConnection;

    constructor(
        amqpConnection: AmqpConnection,
    ) {
        this.amqpConnection = amqpConnection;
    }


    async getDetailsByNetworkId(principal: OrganizationUserEntity, networkId: string) {
        try {

            const orgAppRes = await this.amqpConnection.request<any>({
                exchange: IDENTITY_MODULE,
                routingKey: `${IDENTITY_MODULE}.${RPC_GET_ORG_APP_BY_NAME}`,
                payload: {
                    principal,
                    name: 'EERO',
                },
                timeout: 10000,
            });
            const app = orgAppRes.data;

            const client = new EeroHttpClient();
            const network = await client.getRequest<EeroNetworkEntity>(app, `/2.2/networks/${networkId}`);

            return network;
        } catch (e) {
            console.error(e);
        }
    }


    /**
     *
     * @param principal
     * @param networkId
     * @param body
     */
    public async updateNetworkHomeIdentifier(
        principal: OrganizationUserEntity,
        networkId: string,
        body: IUpdateEeroNetwork,
    ) {
        try {

            const orgAppRes = await this.amqpConnection.request<any>({
                exchange: IDENTITY_MODULE,
                routingKey: `${IDENTITY_MODULE}.${RPC_GET_ORG_APP_BY_NAME}`,
                payload: {
                    principal,
                    name: 'EERO',
                },
                timeout: 10000,
            });
            const app = orgAppRes.data;

            const client = new EeroHttpClient();
            const update = await client.putRequest<EeroNetworkEntity>(
                app,
                `/2.2/networks/${networkId}/label`,
                { label: body.label },
            );

            console.log('update', update);

            return update;
        } catch (e) {
            console.error(e);
        }
    }
}
