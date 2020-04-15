import { RPC_GET_ORG_APP_BY_NAME } from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import { IGetOrganizationAppByName } from '@d19n/models/dist/rabbitmq/rabbitmq.interfaces';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrganizationsAppsRepository } from './organizations.apps.repository';

@Injectable()
export class OrganizationsAppsServiceRpc {

    private readonly connectedAppRepository: OrganizationsAppsRepository;

    public constructor(
        @InjectRepository(OrganizationsAppsRepository) connectedAppRepository: OrganizationsAppsRepository,
    ) {
        this.connectedAppRepository = connectedAppRepository;
    }

    // RPC methods
    @RabbitRPC({
        exchange: process.env.MODULE_NAME,
        routingKey: `${process.env.MODULE_NAME}.${RPC_GET_ORG_APP_BY_NAME}`,
        queue: `${process.env.MODULE_NAME}.${RPC_GET_ORG_APP_BY_NAME}`,
    })
    private async getByOrganizationAppNameRpc(msg: IGetOrganizationAppByName): Promise<any> {
        try {
            // find the user
            const connectedApps = await this.connectedAppRepository.findOne({
                where: { organization: msg.principal.organization, name: msg.name },
            });
            if(connectedApps) {
                return {
                    statusCode: 200,
                    message: 'success',
                    data: connectedApps,
                };
            } else {
                return {
                    statusCode: 404,
                    message: 'no organization apps found with that name',
                    data: undefined,
                };
            }
        } catch (e) {
            console.error(e);
            return {
                statusCode: 500,
                message: e.message,
                data: undefined,
            }

        }
    }


}
