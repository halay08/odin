import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { RPC_GET_ORG_APP_BY_NAME } from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { DbService } from '@d19n/schema-manager/dist/db/db.service';
import { DbRecordsAssociationsService } from '@d19n/schema-manager/dist/db/records/associations/db.records.associations.service';
import { DbRecordAssociationDeleteResult } from '@d19n/schema-manager/dist/db/records/associations/db.records.associations.service.internal';
import { SchemasService } from '@d19n/schema-manager/dist/schemas/schemas.service';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { OrderHelpers } from '../../../common/order.helpers';
import { EeroHttpClient } from '../EeroHttpClient';
import { EeroEntity } from './types/eero.eeros.types';


const { IDENTITY_MODULE, SERVICE_MODULE } = SchemaModuleTypeEnums;
const { CUSTOMER_DEVICE_ROUTER, CUSTOMER_DEVICE_ONT } = SchemaModuleEntityTypeEnums;

@Injectable()
export class NetworkEeroEerosService {


    private dbService: DbService;
    private dbRecordsAssociationsService: DbRecordsAssociationsService;
    private schemasService: SchemasService;
    private amqpConnection: AmqpConnection;
    private orderHelpers: OrderHelpers;

    constructor(
        dbService: DbService,
        dbRecordsAssociationsService: DbRecordsAssociationsService,
        schemasService: SchemasService,
        amqpConnection: AmqpConnection,
    ) {

        this.dbService = dbService;
        this.dbRecordsAssociationsService = dbRecordsAssociationsService;
        this.schemasService = schemasService;
        this.amqpConnection = amqpConnection;

        this.orderHelpers = new OrderHelpers(dbService);
    }

    /**
     *
     * @param principal
     * @param serialNumber
     */
    async getBySerialNumber(principal: OrganizationUserEntity, serialNumber: string) {
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

            const strReplace = serialNumber.replace(/-/g, '');

            const eero = await client.getRequest<EeroEntity>(app, `/2.2/eeros/serial/${strReplace}`);
            const network = await client.getRequest(app, `${eero.network.url}`);

            let networkLabel = {};
            try {
                networkLabel = await client.getRequest<{ label: string }>(app, `${eero.network.url}/label`);
            } catch (e) {
                console.error(e);
            }

            const merged = Object.assign({}, eero, { network: Object.assign({}, network, networkLabel) });

            return merged;

        } catch (e) {
            console.error(e);
        }
    }

    /**
     *
     * @param principal
     * @param serialNumber
     */
    async runSpeedTest(principal: OrganizationUserEntity, serialNumber: string) {
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

            const strReplace = serialNumber.replace(/-/g, '');

            const eero = await client.getRequest<EeroEntity>(app, `/2.2/eeros/serial/${strReplace}`);
            const speedTest = await client.postRequest(app, `${eero.network.url}/speedtest`, {
                server_url: 'https://google.com',
            });

            console.log('speedTest', speedTest);

            return speedTest;

        } catch (e) {
            console.error(e);
        }
    }


    /**
     *
     * @param principal
     * @param dbRecordId
     * @param body
     */
    public async addHomeIdentifier(principal: OrganizationUserEntity, dbRecordId: string) {
        try {

            // get the router > order_item
            const customerDeviceRouter = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                dbRecordId,
                [ 'OrderItem' ],
            );
            const deviceOrderItem = customerDeviceRouter['OrderItem'].dbRecords;

            if(deviceOrderItem) {
                // get the order_item > order
                const orderItem = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                    principal.organization,
                    deviceOrderItem[0].id,
                    [ 'Order' ],
                );

                const order = orderItem['Order'].dbRecords;
                const label = `${order[0].recordNumber}:${orderItem.recordNumber}`;

                const update = await this.updateEeroNetworkHomeIdentifier(
                    principal,
                    getProperty(customerDeviceRouter, 'SerialNumber'),
                    label,
                );
                console.log('update', update);

                return update;
            }

            return;
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }

    /**
     *
     * @param principal
     * @param dbRecordId
     * @param body
     */
    public async removeHomeIdentifier(principal: OrganizationUserEntity, dbRecordId: string) {
        try {

            // get the router > order_item
            const customerDeviceRouter = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                dbRecordId,
                [ 'OrderItem' ],
            );
            const deviceOrderItem = customerDeviceRouter['OrderItem'].dbRecords;

            if(deviceOrderItem) {

                const label = null;

                const update = await this.updateEeroNetworkHomeIdentifier(
                    principal,
                    getProperty(customerDeviceRouter, 'SerialNumber'),
                    label,
                );

                return update;
            }

            return;
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }


    /**
     *
     * @param principal
     * @param serialNumber
     */
    private async updateEeroNetworkHomeIdentifier(
        principal: OrganizationUserEntity,
        serialNumber: string,
        label: string,
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

            if(!serialNumber) {
                throw new ExceptionType(422, 'router is missing serial number');
            }

            const strReplace = serialNumber.replace(/-/g, '');

            // get the eero so we know the network to update
            const eero = await client.getRequest<EeroEntity>(app, `/2.2/eeros/serial/${strReplace}`);

            const networkLabel = await client.putRequest<{ label: string }>(
                app,
                `${eero.network.url}/label`,
                { label },
            );

            return networkLabel;

        } catch (e) {
            console.error(e);
        }
    }

    /**
     *
     * @param principal
     * @param param2
     */
    async addRouterToOnt(principal: OrganizationUserEntity, params: { orderItemId: string; customerDeviceId: string }) {
        try {

            const routerDevice = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                params.customerDeviceId,
            );

            // get the order item > ont
            const ontDevice = await this.orderHelpers.getOntFromOrderByOrderItemId(principal, params.orderItemId);

            if(ontDevice) {
                // create an association between the ont device and the address
                const updateDto = new DbRecordCreateUpdateDto();
                updateDto.entity = `${SERVICE_MODULE}:${CUSTOMER_DEVICE_ROUTER}`;
                updateDto.title = getProperty(routerDevice, 'SerialNumber');
                updateDto.associations = [
                    {
                        recordId: ontDevice ? ontDevice.id : undefined,
                    },
                ];

                return await this.dbService.updateDbRecordsByPrincipalAndId(
                    principal,
                    params.customerDeviceId,
                    updateDto,
                );
            }

            return undefined;

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }

    /**
     *
     * @param principal
     * @param param2
     */
    async removeRouterFromOnt(
        principal: OrganizationUserEntity,
        params: { orderItemId: string; customerDeviceId: string },
    ): Promise<DbRecordAssociationDeleteResult> {
        try {
            // add the ont device and address association
            const router = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                params.customerDeviceId,
                [ CUSTOMER_DEVICE_ONT ],
            );
            const customerDeviceOnt = router[CUSTOMER_DEVICE_ONT].dbRecords;

            // then delete the association
            if(customerDeviceOnt) {
                return await this.dbRecordsAssociationsService.deleteRelatedRecordById(
                    principal,
                    customerDeviceOnt[0].dbRecordAssociation.id,
                )
            }

            return { affected: 0, dbRecordAssociation: undefined };
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }
}
