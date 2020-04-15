import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { SendgridEmailEntity } from '@d19n/models/dist/notifications/sendgrid/email/sendgrid.email.entity';
import { SUB_SEND_DYNAMIC_EMAIL } from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { DbService } from '@d19n/schema-manager/dist/db/db.service';
import { DbRecordsAssociationsService } from '@d19n/schema-manager/dist/db/records/associations/db.records.associations.service';
import { SchemasService } from '@d19n/schema-manager/dist/schemas/schemas.service';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { NetworkAdtranOltService } from '../../olt/network.adtran.olt.service';
import { parseEmailTemplateWithParams } from '../../olt/templates/add-onu-email-template';
import { validateEmail } from '../validators/email.validators';
import { validateItemToProvision } from '../validators/order.item.validators';

const { NOTIFICATION_MODULE } = SchemaModuleTypeEnums;
const { PRODUCT, CUSTOMER_DEVICE_ONT, WORK_ORDER, ADDRESS, SERVICE } = SchemaModuleEntityTypeEnums;

@Injectable()
export class NetworkAdtranOnuDataService {

    private dbService: DbService;
    private dbRecordsAssociationsService: DbRecordsAssociationsService;
    private schemasService: SchemasService;
    private amqpConnection: AmqpConnection;
    private networkAdtranOltService: NetworkAdtranOltService;

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

        this.networkAdtranOltService = networkAdtranOltService;
    }


    /**
     *
     * @param principal
     * @param orderItemId
     * @param body
     */
    public async activateServiceByOrderItemId(principal: OrganizationUserEntity, orderItemId: string): Promise<any> {
        try {

            const { workOrder, ontDevice, service, address } = await this.getWorkOrderAndOrderItemToProvision(
                principal,
                orderItemId,
            );

            const oltIp = getProperty(ontDevice, 'OltIpAddress');
            const port = getProperty(ontDevice, 'PONPort');
            const serialNumber = getProperty(ontDevice, 'SerialNumber');
            const onuInterfaceName = getProperty(ontDevice, 'OnuInterfaceName');
            const fullAddress = getProperty(address, 'FullAddress');
            const uploadSpeed = getProperty(service, 'UploadSpeed');
            const downloadSpeed = getProperty(service, 'DownloadSpeed');

            // Do not allow the device to be activated more than once.
            // if an onuInterfaceName exists then it was assigned during the last activation
            if(onuInterfaceName) {

                throw new ExceptionType(301, 'This device is already activated');

            }

            const newActivation = await this.networkAdtranOltService.activateOnuWithData(principal, {
                oltIp,
                port,
                fullAddress,
                serialNumber,
                uploadSpeed,
                downloadSpeed,
            });
            console.log('newActivation', newActivation);

            // Send an email request as a fall back / notification of the provisioning
            const { ontConfigTemplate } = parseEmailTemplateWithParams(ontDevice, address);
            this.sendProvisionRequestEmail(
                principal,
                workOrder.id,
                'SENDGRID_WORK_ORDER_PROVISION_REQUEST',
                {
                    ontConfigTemplate,
                    oltName: newActivation.nextAvailableOnuInterface.oltIp,
                    ponPort: newActivation.newDevice.ponPort,
                    serialNumber,
                },
            );

            // add the OnuInterfaceName to the customer device
            await this.dbService.updateDbRecordsByPrincipalAndId(principal, ontDevice.id, {
                entity: 'ServiceModule:CustomerDeviceOnt',
                title: serialNumber,
                properties: {
                    OnuInterfaceName: newActivation.nextAvailableOnuInterface.interfaceName,
                    OltIpAddress: newActivation.nextAvailableOnuInterface.oltIp,
                    PONPort: newActivation.newDevice.ponPort,
                },
                associations: [
                    {
                        recordId: address.id,
                    },
                    {
                        recordId: newActivation.olt.id,
                    },
                ],
            });

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
    public async deactivateServiceByOrderItemId(
        principal: OrganizationUserEntity,
        orderItemId: string,
    ): Promise<any> {
        try {

            const { ontDevice } = await this.getWorkOrderAndOrderItemToProvision(
                principal,
                orderItemId,
            );

            const oltIp = getProperty(ontDevice, 'OltIpAddress');
            const onuInterfaceName = getProperty(ontDevice, 'OnuInterfaceName');

            if(!onuInterfaceName) {
                throw new ExceptionType(400, 'no onu interface name provided');
            }
            const { onuId, port } = this.networkAdtranOltService.transformInterfaceNameFromOltConfig(onuInterfaceName);

            const olt = await this.networkAdtranOltService.getOltByIpAddress(principal, oltIp);

            const model = getProperty(olt, 'Model');

            const deactivate = await this.networkAdtranOltService.deactivateOnuAndData(
                principal,
                { oltIp, oltModel: model, port, onuId },
            );


            await this.dbService.updateDbRecordsByPrincipalAndId(principal, ontDevice.id, {
                entity: 'ServiceModule:CustomerDeviceOnt',
                properties: {
                    OnuInterfaceName: null,
                    OltIpAddress: null,
                    PONPort: null,
                    RxPower: null,
                    FibreLength: null,
                },
            });

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
    public async checkServiceByOrderItemId(principal: OrganizationUserEntity, orderItemId: string) {
        try {
            const { ontDevice, address } = await this.getWorkOrderAndOrderItemToProvision(
                principal,
                orderItemId,
            );

            const oltIp = getProperty(ontDevice, 'OltIpAddress');
            const onuInterfaceName = getProperty(ontDevice, 'OnuInterfaceName');

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
            updateDto.entity = 'ServiceModule:CustomerDeviceOnt';
            updateDto.properties = {
                RxPower: statusCheck.rxPower,
                FibreLength: statusCheck.fibreLength,
            };
            await this.dbService.updateDbRecordsByPrincipalAndId(principal, ontDevice.id, updateDto);

            return statusCheck;

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }

    /**
     *
     * @param principal
     * @param orderItemId
     * @private
     */
    private async getWorkOrderAndOrderItemToProvision(principal: OrganizationUserEntity, orderItemId: string) {
        try {

            // get the work order order item
            const orderItem = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                orderItemId,
                [ PRODUCT, CUSTOMER_DEVICE_ONT, WORK_ORDER ],
            );

            const ontDevice = orderItem[CUSTOMER_DEVICE_ONT].dbRecords;
            const workOrders = orderItem[WORK_ORDER].dbRecords;
            const product = orderItem[PRODUCT].dbRecords;

            if(!workOrders) {
                throw new ExceptionType(400, 'Please add this item to a work order before provisioning');
            }

            if(!ontDevice) {
                throw new ExceptionType(400, 'no ONT to prevision, please enter the device details');
            }

            if(!product) {
                throw new ExceptionType(400, 'no product related to this order item, correct and try again.');
            }

            // get product service
            const productRes = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                product[0].id,
                [ SERVICE ],
            );
            const service = productRes[SERVICE].dbRecords;

            if(!service) {
                throw new ExceptionType(400, 'no service related to this product, correct and try again.');
            }

            // get work order with order items
            const workOrder = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                workOrders[0].id,
                [ ADDRESS ],
            );

            const address = workOrder[ADDRESS].dbRecords;
            if(!address) {
                throw new ExceptionType(400, 'no address added to the order, add one and try again.');
            }


            // validate the item has all required fields
            await validateItemToProvision(principal, orderItem);

            return { ontDevice: ontDevice[0], service: service[0], workOrder, address: address[0] };

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }

    /**
     * templateLabels:
     *
     * @param principal
     * @param workOrderId
     * @param templateLabel
     * @param body
     */
    public async sendProvisionRequestEmail(
        principal: OrganizationUserEntity,
        workOrderId: string,
        templateLabel: string,
        config: any,
        body?: SendgridEmailEntity,
    ): Promise<any> {
        try {

            const { CONTACT, ADDRESS, ORDER_ITEM, SERVICE_APPOINTMENT } = SchemaModuleEntityTypeEnums;

            const workOrder = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                workOrderId,
                [ CONTACT, ADDRESS, ORDER_ITEM, SERVICE_APPOINTMENT ],
            );

            await validateEmail(workOrder);

            const workOrderAddress = workOrder[ADDRESS].dbRecords;
            const workOrderItems = workOrder[ORDER_ITEM].dbRecords;

            const newEmail = new SendgridEmailEntity();
            newEmail.to = [
                { email: 'frank@youfibre.com' },
                { email: 'jeremy@netomnia.com' },
            ];
            newEmail.from = principal.organization.billingReplyToEmail;
            newEmail.templateLabel = templateLabel;
            newEmail.dynamicTemplateData = Object.assign({}, {
                subject: `Provision Request: ${workOrder.recordNumber} - ${workOrderAddress[0].title}`,
                recordId: workOrderId,
                recordNumber: workOrder.recordNumber,
                fullAddress: workOrderAddress[0].title,
                workOrder: workOrder['properties'],
                orderItems: workOrderItems.map(elem => ({
                    lineItemName: elem.title,
                })),
                ontConfigTemplate: config.ontConfigTemplate,
                oltName: config.oltName,
                ponPort: config.ponPort,
                serialNumber: config.serialNumber,
            }, body ? body.dynamicTemplateData : {});

            await this.amqpConnection.publish(
                NOTIFICATION_MODULE,
                `${NOTIFICATION_MODULE}.${SUB_SEND_DYNAMIC_EMAIL}`,
                {
                    principal,
                    body: newEmail,
                },
            )

            return { status: 'processed' };
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }

}
