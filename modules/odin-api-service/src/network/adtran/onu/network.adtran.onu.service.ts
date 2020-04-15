import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { getFirstRelation, getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { DbService } from '@d19n/schema-manager/dist/db/db.service';
import { DbRecordsAssociationsService } from '@d19n/schema-manager/dist/db/records/associations/db.records.associations.service';
import { DbRecordAssociationDeleteResult } from '@d19n/schema-manager/dist/db/records/associations/db.records.associations.service.internal';
import { SchemasService } from '@d19n/schema-manager/dist/schemas/schemas.service';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { OrderHelpers } from '../../../common/order.helpers';
import { NetworkAdtranOltService } from '../olt/network.adtran.olt.service';

const { SERVICE_MODULE } = SchemaModuleTypeEnums;
const { CUSTOMER_DEVICE_ONT } = SchemaModuleEntityTypeEnums;


@Injectable()
export class NetworkAdtranOnuService {

    private dbService: DbService;
    private dbRecordsAssociationsService: DbRecordsAssociationsService;
    private schemasService: SchemasService;
    private amqpConnection: AmqpConnection;
    private orderHelpers: OrderHelpers;

    private networkAdtranOltService: NetworkAdtranOltService

    constructor(
        dbService: DbService,
        dbRecordsAssociationsService: DbRecordsAssociationsService,
        schemasService: SchemasService,
        amqpConnection: AmqpConnection,
        networkAdtranOltService: NetworkAdtranOltService,
    ) {

        this.dbService = dbService;
        this.dbRecordsAssociationsService = dbRecordsAssociationsService;
        this.schemasService = schemasService;
        this.amqpConnection = amqpConnection;

        this.orderHelpers = new OrderHelpers(dbService);

        this.networkAdtranOltService = networkAdtranOltService;
    }

    /**
     *
     * @param principal
     * @param orderItemId
     * @param body
     */
    public async addOnu(principal: OrganizationUserEntity, custDeviceId: string): Promise<any> {
        try {

            const onu = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                custDeviceId,
                [
                    SchemaModuleEntityTypeEnums.ADDRESS,
                ],
            );

            const address = getFirstRelation(onu, SchemaModuleEntityTypeEnums.ADDRESS);

            const oltIp = getProperty(onu, 'OltIpAddress');
            const port = getProperty(onu, 'PONPort');
            const serialNumber = getProperty(onu, 'SerialNumber');
            const onuInterfaceName = getProperty(onu, 'OnuInterfaceName');
            const fullAddress = getProperty(address, 'FullAddress');
            const exPolygonId = getProperty(address, 'ExPolygonId');

            // find the olt by exPolygonId and use that oltIp to find the match and provision

            // Do not allow the device to be activated more than once.
            // if an onuInterfaceName exists then it was assigned during the last activation
            if(onuInterfaceName) {
                throw new ExceptionType(500, 'This device is already activated');
            }

            console.log('BEFORE_ACTIVATE');
            const newActivation = await this.networkAdtranOltService.activateOnu(principal, {
                oltIp,
                port,
                fullAddress,
                exPolygonId,
                serialNumber,
            })

            console.log('AFTER_ACTIVATE');
            console.log('-------HERE', newActivation);

            // add the OnuInterfaceName to the customer device
            const update = new DbRecordCreateUpdateDto();
            update.entity = 'ServiceModule:CustomerDeviceOnt';
            update.title = serialNumber;
            update.properties = {
                OnuInterfaceName: newActivation.nextAvailableOnuInterface.interfaceName,
                OltIpAddress: newActivation.nextAvailableOnuInterface.oltIp,
                PONPort: newActivation.newDevice.ponPort,
            };
            update.associations = [
                {
                    recordId: newActivation.olt.id,
                },
            ];

            console.log('UPDATE_ACTIVATED_ONU', update);

            await this.dbService.updateDbRecordsByPrincipalAndId(principal, onu.id, update);

            return newActivation;

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }

    /**
     *
     * @param principal
     * @param orderItemId
     * @param body
     */
    public async addOnuData(principal: OrganizationUserEntity, custDeviceId: string): Promise<any> {
        try {

            const onu = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                custDeviceId,
                [
                    SchemaModuleEntityTypeEnums.ADDRESS,
                    SchemaModuleEntityTypeEnums.SERVICE,
                    SchemaModuleEntityTypeEnums.NETWORK_DEVICE,
                ],
            );

            const address = getFirstRelation(onu, SchemaModuleEntityTypeEnums.ADDRESS);
            const service = getFirstRelation(onu, SchemaModuleEntityTypeEnums.SERVICE);
            const olt = getFirstRelation(onu, SchemaModuleEntityTypeEnums.NETWORK_DEVICE);

            const oltModel = getProperty(olt, 'Model');
            const oltIp = getProperty(onu, 'OltIpAddress');
            const serialNumber = getProperty(onu, 'SerialNumber');
            const onuInterfaceName = getProperty(onu, 'OnuInterfaceName');
            const fullAddress = getProperty(address, 'FullAddress');
            const exPolygonId = getProperty(address, 'ExPolygonId');
            const uploadSpeed = getProperty(service, 'UploadSpeed');
            const downloadSpeed = getProperty(service, 'DownloadSpeed');

            const { onuId, port } = this.networkAdtranOltService.transformInterfaceNameFromOltConfig(onuInterfaceName);

            // Do not allow the device to be activated more than once.
            // if an onuInterfaceName exists then it was assigned during the last activation
            if(onuInterfaceName) {
                throw new ExceptionType(500, 'This device is already activated');
            }

            const newActivation = await this.networkAdtranOltService.activateOnuData(principal, {
                oltIp,
                oltModel,
                port,
                onuId,
                fullAddress,
                serialNumber,
                uploadSpeed,
                downloadSpeed,
            })

            return newActivation;

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }

    /**
     *
     * @param principal
     * @param orderItemId
     */
    public async removeOnu(
        principal: OrganizationUserEntity,
        custDeviceId: string,
    ): Promise<any> {
        try {

            const onu = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                custDeviceId,
                [
                    SchemaModuleEntityTypeEnums.NETWORK_DEVICE,
                ],
            );

            const olt = getFirstRelation(onu, SchemaModuleEntityTypeEnums.NETWORK_DEVICE);

            const oltModel = getProperty(olt, 'Model');
            const oltIp = getProperty(onu, 'OltIpAddress');
            const onuInterfaceName = getProperty(onu, 'OnuInterfaceName');
            const serialNumber = getProperty(onu, 'SerialNumber');

            if(!onuInterfaceName) {
                throw new ExceptionType(400, 'no onu interface name provided');
            }
            const { onuId, port } = this.networkAdtranOltService.transformInterfaceNameFromOltConfig(onuInterfaceName);

            const deactivate = await this.networkAdtranOltService.deactivateOnu(
                principal,
                { oltIp, oltModel, port, onuId },
            );

            await this.dbService.updateDbRecordsByPrincipalAndId(principal, onu.id, {
                entity: 'ServiceModule:CustomerDeviceOnt',
                title: serialNumber,
                properties: {
                    OnuInterfaceName: null,
                    OltIpAddress: null,
                    PONPort: null,
                    RxPower: null,
                    FibreLength: null,
                },
            });

            // remove the address dbRecordAssociation;

            return deactivate;

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }

    /**
     *
     * @param principal
     * @param orderItemId
     */
    public async checkOnuStatus(principal: OrganizationUserEntity, custDeviceId: string) {
        try {

            const onu = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                custDeviceId,
                [],
            );

            const oltIp = getProperty(onu, 'OltIpAddress');
            const onuInterfaceName = getProperty(onu, 'OnuInterfaceName');

            if(!onuInterfaceName) {
                throw new ExceptionType(400, 'no onu interface name provided, cannot complete healt check');
            }

            if(!oltIp) {
                throw new ExceptionType(400, 'missing olt ip address');
            }

            const { onuId, port } = this.networkAdtranOltService.transformInterfaceNameFromOltConfig(onuInterfaceName);

            if(!onuInterfaceName) {

                throw new ExceptionType(400, 'no onu interface name provided');

            }

            const statusCheck = await this.networkAdtranOltService.getOnuStatus(principal, { oltIp, port, onuId });

            // update the ontDevice with the status check results
            const updateDto = new DbRecordCreateUpdateDto();
            updateDto.entity = `${SERVICE_MODULE}:${CUSTOMER_DEVICE_ONT}`;
            updateDto.properties = {
                RxPower: statusCheck.rxPower,
                FibreLength: statusCheck.fibreLength,
            };
            await this.dbService.updateDbRecordsByPrincipalAndId(principal, onu.id, updateDto);

            return statusCheck;

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }


    /**
     *
     * @param principal
     * @param params
     */
    public async addAddressToOnu(
        principal: OrganizationUserEntity,
        params: { orderItemId: string, customerDeviceId: string },
    ) {
        try {
            // get the order item > order > address
            const address = await this.orderHelpers.getOrderAddressFromOrderItemId(principal, params.orderItemId);

            // create an association between the ont device and the address
            const updateDto = new DbRecordCreateUpdateDto();
            updateDto.entity = `${SERVICE_MODULE}:${CUSTOMER_DEVICE_ONT}`;
            updateDto.associations = [
                {
                    recordId: address ? address.id : undefined,
                },
            ];

            return await this.dbService.updateDbRecordsByPrincipalAndId(principal, params.customerDeviceId, updateDto);

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }

    }

    /**
     *
     * @param principal
     * @param params
     */
    public async removeAddressFromOnu(
        principal: OrganizationUserEntity,
        params: { customerDeviceId: string },
    ): Promise<DbRecordAssociationDeleteResult> {
        try {


            // add the ont device and address association
            const onu = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                params.customerDeviceId,
                [
                    SchemaModuleEntityTypeEnums.ADDRESS,
                ],
            );

            const address = getFirstRelation(onu, SchemaModuleEntityTypeEnums.ADDRESS);

            // then delete the association
            if(address) {
                return await this.dbRecordsAssociationsService.deleteRelatedRecordById(
                    principal,
                    address.dbRecordAssociation.id,
                );
            }

            return { affected: 0, dbRecordAssociation: undefined };

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }

    /**
     *
     * @param principal
     * @param params
     */
    public async removeOnuFromOlt(
        principal: OrganizationUserEntity,
        params: { customerDeviceId: string },
    ): Promise<DbRecordAssociationDeleteResult> {
        try {
            // add the ont device and address association
            const onu = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                params.customerDeviceId,
                [
                    SchemaModuleEntityTypeEnums.NETWORK_DEVICE,
                ],
            );

            const olt = getFirstRelation(onu, SchemaModuleEntityTypeEnums.NETWORK_DEVICE);

            // then delete the association
            if(olt) {
                return await this.dbRecordsAssociationsService.deleteRelatedRecordById(
                    principal,
                    olt.dbRecordAssociation.id,
                );
            }

            return { affected: 0, dbRecordAssociation: undefined };

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }

}
