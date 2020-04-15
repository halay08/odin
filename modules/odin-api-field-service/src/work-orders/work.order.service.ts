import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { SendgridEmailEntity } from '@d19n/models/dist/notifications/sendgrid/email/sendgrid.email.entity';
import { SUB_SEND_DYNAMIC_EMAIL } from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import { DbRecordAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/association/dto/db.record.association.create.update.dto';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty, getPropertyFromRelation } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { DbService } from '@d19n/schema-manager/dist/db/db.service';
import { DbRecordsAssociationsService } from '@d19n/schema-manager/dist/db/records/associations/db.records.associations.service';
import { PipelineEntitysService } from '@d19n/schema-manager/dist/pipelines/pipelines.service';
import { PipelineEntitysStagesService } from '@d19n/schema-manager/dist/pipelines/stages/pipelines.stages.service';
import { SchemasService } from '@d19n/schema-manager/dist/schemas/schemas.service';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { forwardRef, Inject } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as moment from 'moment';
import { ServiceAppointmentsService } from '../service-appointment/service.appointments.service';
import { WorkOrderWithAppointmentCreateDto } from './types/work.order.with.appointment.create.dto';

const { FIELD_SERVICE_MODULE, NOTIFICATION_MODULE } = SchemaModuleTypeEnums;
const {
    ACCOUNT,
    CONTACT,
    PRODUCT,
    ORDER_ITEM,
    WORK_ORDER,
    CUSTOMER_DEVICE_ONT,
    CUSTOMER_DEVICE_ROUTER,
    ADDRESS,
    SERVICE_APPOINTMENT,
} = SchemaModuleEntityTypeEnums;

dotenv.config();

export class WorkOrderService {

    private dbService: DbService;
    private dbRecordsAssociationsService: DbRecordsAssociationsService;
    private serviceAppointmentsService: ServiceAppointmentsService;
    private pipelinesService: PipelineEntitysService;
    private pipelineEntitysStagesService: PipelineEntitysStagesService;
    private amqpConnection: AmqpConnection;

    constructor(
        @Inject(forwardRef(() => DbRecordsAssociationsService)) dbRecordsAssociationsService: DbRecordsAssociationsService,
        @Inject(forwardRef(() => DbService)) dbService: DbService,
        @Inject(forwardRef(() => ServiceAppointmentsService)) serviceAppointmentsService: ServiceAppointmentsService,
        pipelinesService: PipelineEntitysService,
        pipelineEntitysStagesService: PipelineEntitysStagesService,
        amqpConnection: AmqpConnection,
        private readonly schemasService: SchemasService,
    ) {
        this.dbService = dbService;
        this.dbRecordsAssociationsService = dbRecordsAssociationsService;
        this.serviceAppointmentsService = serviceAppointmentsService;
        this.pipelinesService = pipelinesService;
        this.pipelineEntitysStagesService = pipelineEntitysStagesService;
        this.amqpConnection = amqpConnection;
        this.schemasService = schemasService;
    }

    /**
     *
     * @param principal
     * @param projectId
     * @param body
     */
    public async handleWorkOrderServiceAppointmentDeleted(
        principal: OrganizationUserEntity,
        serviceAppointmentId: string,
    ) {
        try {
            // Get the work order schema
            const workOrderSchema = await this.schemasService.getSchemaByOrganizationAndEntity(
                principal.organization,
                `${FIELD_SERVICE_MODULE}:${WORK_ORDER}`,
            );

            // get the work order records using the deleted service appointment Id and work Order schema
            const parentRecordIds = await this.dbRecordsAssociationsService.getRelatedParentRecordIds(
                principal.organization,
                {
                    recordId: serviceAppointmentId,
                    parentSchemaId: workOrderSchema.id,
                    relatedAssociationId: undefined,
                },
                { withDeleted: true },
            );

            if(parentRecordIds && parentRecordIds.length === 1) {
                // Update the work order stage
                const stageKey = 'WorkOrderStageAccepted';
                const workOrderId = parentRecordIds[0];

                // replace with get stage and use the stage entity which will contain rules
                const workOrder = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                    principal.organization,
                    workOrderId,
                    [],
                );

                // Only if the work order is not in the cancelled stage
                if(!workOrder.stage.isFail) {
                    await this.changeWorkOrderStage(principal, workOrderId, stageKey);
                }
                // await this.sendEmail(principal, workOrderId, 'SENDGRID_WORK_ORDER_CANCELED_CONFIRMATION');
            }
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }

    /**
     *
     * @param principal
     * @param projectId
     * @param body
     */
    public async handleWorkOrderServiceAppointmentCreated(
        principal: OrganizationUserEntity,
        serviceAppointmentId: string,
    ) {
        try {
            // Get the service appointment work order
            const serviceAppointment = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                serviceAppointmentId,
                [ WORK_ORDER ],
            );

            // get the work order records
            const relatedRecords = serviceAppointment[WORK_ORDER].dbRecords;

            if(relatedRecords && relatedRecords.length === 1) {
                // Update the work order stage
                const stageKey = 'WorkOrderStageScheduled';
                const workOrder = relatedRecords[0];

                await this.changeWorkOrderStage(principal, workOrder.id, stageKey);
                await this.sendEmail(principal, workOrder.id, 'SENDGRID_WORK_ORDER_CONFIRMATION');

                return workOrder;
            }

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }


    /**
     *
     * @param principal
     * @param workOrderId
     * @param stageKey
     */
    public async changeWorkOrderStage(principal: OrganizationUserEntity, workOrderId: string, stageKey: string) {
        try {
            const stage = await this.pipelineEntitysStagesService.getPipelineAndStagesByStageKey(
                principal.organization,
                stageKey,
            );
            const updateDto = new DbRecordCreateUpdateDto();
            updateDto.entity = `${FIELD_SERVICE_MODULE}:${WORK_ORDER}`;
            updateDto.stageId = stage.id;

            const res = await this.dbService.updateDbRecordsByPrincipalAndId(principal, workOrderId, updateDto);

            return res;
        } catch (e) {
            console.error(e);

            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }

    /**
     *
     * @param principal
     * @param orderId
     * @param body
     * @param headers
     */
    public async createWorkOrderFromOrder(
        principal: OrganizationUserEntity,
        orderId: string,
        body: WorkOrderWithAppointmentCreateDto,
    ) {
        try {

            const order = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                orderId,
                [ CONTACT, ADDRESS, ORDER_ITEM, WORK_ORDER, ACCOUNT ],
            );
            const orderContact = order[CONTACT].dbRecords;
            const orderAddress = order[ADDRESS].dbRecords;
            const orderItems = order[ORDER_ITEM].dbRecords;
            const account = order[ACCOUNT].dbRecords;

            let orderItemAssociations: DbRecordAssociationCreateUpdateDto[] = [];

            if(body.orderItems) {
                orderItemAssociations = body.orderItems;
            } else {
                orderItemAssociations = orderItems.map(item => ({
                    recordId: item.id,
                    quantity: 1,
                }))
            }

            await this.validateCreateWorkOrderFromOrder(order, body);

            const addrFullAddress = getPropertyFromRelation(order, ADDRESS, 'FullAddress');
            const addrUdprn = getPropertyFromRelation(order, ADDRESS, 'UDPRN');

            // Create an install work order
            const newWorkOrder = new DbRecordCreateUpdateDto();
            newWorkOrder.entity = `${FIELD_SERVICE_MODULE}:${WORK_ORDER}`;
            newWorkOrder.title = addrFullAddress;
            newWorkOrder.properties = {
                Type: body['Type'] ? body.Type : 'INSTALL',
                RequestedDeliveryDate: body['Date'] ? body.Date : undefined,
                UDPRN: addrUdprn,
            };
            newWorkOrder.associations = [
                {
                    recordId: order.id,
                },
                {
                    recordId: orderAddress[0].id,
                },
                {
                    recordId: orderContact[0].id,
                },
                {
                    recordId: account[0].id,
                },
                ...orderItemAssociations,
            ];

            const workOrder = await this.dbService.updateOrCreateDbRecordsByPrincipal(
                principal,
                [ newWorkOrder ],
                { upsert: false },
            );

            // Create a service appointment (optional on create)
            if(body && body['Date'] && body['TimeBlock']) {
                await this.serviceAppointmentsService.createServiceAppointmentForWorkOrder(
                    principal,
                    workOrder[0].id,
                    body,
                );
            }

            return workOrder;
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation, e.data);
        }
    }

    /**
     *
     * @param order
     * @private
     */
    private validateCreateWorkOrderFromOrder(order: DbRecordEntityTransform, body: WorkOrderWithAppointmentCreateDto) {

        const { CONTACT, ADDRESS, ORDER_ITEM, WORK_ORDER } = SchemaModuleEntityTypeEnums;

        const orderItem = order[ORDER_ITEM].dbRecords;
        const orderAddress = order[ADDRESS].dbRecords;
        const orderContact = order[CONTACT].dbRecords;
        const orderWorkOrders = order[WORK_ORDER].dbRecords;

        if(!orderItem) {
            throw new ExceptionType(400, 'please add order items to the order');
        }
        if(!orderContact) {
            throw new ExceptionType(400, 'please add a contact to the order');
        }
        if(!orderAddress) {
            throw new ExceptionType(400, 'please add an address to the order');
        }
        if(orderWorkOrders) {
            // verify that there is not an Install work order already created and not in the success / fail stage
            const workOrderInProgress = orderWorkOrders.find(elem => !elem.stage.isFail);

            if(workOrderInProgress) {
                const workOrderType = getProperty(workOrderInProgress, 'Type');
                if(workOrderType === 'INSTALL' && body['Type'] === 'INSTALL') {
                    throw new ExceptionType(400, 'we already have an install work order in progress or completed.');
                }
            }
        }
    }

    /**
     * When cancelling a work order we want to
     * cancel the customer work order
     * cancel build work orders that are not in build scheduled
     * and delete the current service appointment on the customer work order
     * @param principal
     * @param workOrderId
     * @param headers
     */
    public async cancelWorkOrderByPrincipalAndId(
        principal: OrganizationUserEntity,
        workOrderId: string,
    ) {
        try {

            const { WORK_ORDER, SERVICE_APPOINTMENT } = SchemaModuleEntityTypeEnums;

            const customerWorkOrder = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                workOrderId,
                [ WORK_ORDER, SERVICE_APPOINTMENT ],
            );
            const workOrderPipeline = await this.pipelinesService.getPipelineAndStagesByModuleName(
                principal.organization,
                SchemaModuleTypeEnums.FIELD_SERVICE_MODULE,
                WORK_ORDER,
            );

            // Get the customer work order pipeline
            // Get the customer work order cancelled stage
            const customerWorkOrderCancelledStage = workOrderPipeline.stages.find(elem => elem.key === 'WorkOrderStageCancelled');
            // Move customer work order to cancelled if it is not in the Done stage
            if(customerWorkOrder.stage.position < 3) {
                const body = new DbRecordCreateUpdateDto();
                body.schemaId = customerWorkOrder.schemaId;
                body.stageId = customerWorkOrderCancelledStage.id;
                await this.dbService.updateDbRecordsByPrincipalAndId(principal, workOrderId, body);
            }
            // Delete service appointment
            if(customerWorkOrder[SERVICE_APPOINTMENT] && customerWorkOrder[SERVICE_APPOINTMENT].dbRecords) {
                await this.dbService.deleteByPrincipalAndId(
                    principal,
                    customerWorkOrder[SERVICE_APPOINTMENT].dbRecords[0].id,
                );
            }
            return { status: 'processed' };
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation, e.data);
        }
    }

    /**
     *
     * @param principal
     * @param recordId
     * @param requestBody
     * @param headers
     */
    public async handleStageChange(
        principal: OrganizationUserEntity,
        recordId: any,
        requestBody: DbRecordCreateUpdateDto,
    ) {
        try {
            // replace with get stage and use the stage entity which will contain rules
            const workOrder = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                recordId,
                [],
            );
            if(workOrder.stage && workOrder.stage.key === 'WorkOrderStageCancelled') {
                // run work order cancellation process
                await this.cancelWorkOrderByPrincipalAndId(principal, workOrder.id);
            }
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation, e.data);
        }
    }

    /**
     * templateLabels:
     * SENDGRID_WORK_ORDER_STAGE_CHANGE
     * SENDGRID_WORK_ORDER_CONFIRMATION
     * SENDGRID_WORK_ORDER_CANCELED_CONFIRMATION
     *
     * @param principal
     * @param workOrderId
     * @param templateLabel
     * @param body
     */
    public async sendEmail(
        principal: OrganizationUserEntity,
        workOrderId: string,
        templateLabel: string,
        body?: SendgridEmailEntity,
    ): Promise<any> {
        try {

            const { CONTACT, ADDRESS, ORDER_ITEM, SERVICE_APPOINTMENT } = SchemaModuleEntityTypeEnums;

            const workOrder = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                workOrderId,
                [ CONTACT, ADDRESS, ORDER_ITEM, SERVICE_APPOINTMENT ],
            );

            await this.validateWorkOrderHasRequiredRelations(workOrder);

            const workOrderAddress = workOrder[ADDRESS].dbRecords;
            const workOrderServiceApp = workOrder[SERVICE_APPOINTMENT].dbRecords;
            const workOrderItems = workOrder[ORDER_ITEM].dbRecords;


            const newEmail = new SendgridEmailEntity();
            newEmail.to = getPropertyFromRelation(workOrder, CONTACT, 'EmailAddress');
            newEmail.from = principal.organization.billingReplyToEmail;
            newEmail.templateLabel = templateLabel;
            newEmail.dynamicTemplateData = Object.assign({}, {
                recordId: workOrderId,
                recordNumber: workOrder.recordNumber,
                contactFirstName: getPropertyFromRelation(workOrder, CONTACT, 'FirstName'),
                address: workOrderAddress[0]['properties'],
                workOrder: workOrder['properties'],
                serviceAppointment: Object.assign({}, workOrderServiceApp[0].properties, {
                    Date: moment(getPropertyFromRelation(workOrder, SERVICE_APPOINTMENT, 'Date')).format(
                        'DD-MM-YYYY'),
                    TimeRange: getPropertyFromRelation(
                        workOrder,
                        SERVICE_APPOINTMENT,
                        'TimeBlock',
                    ) === 'AM' ? '8am - 1pm' : '1pm - 6pm',
                }),
                currentStage: workOrder.stage.name,
                orderItems: workOrderItems.map(elem => ({
                    lineItemName: elem.title,
                    lineItemQuantity: getProperty(elem, 'Quantity'),
                    lineItemDescription: getProperty(elem, 'Description'),
                })),
                organizationName: principal.organization.name,
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


    /**
     *
     * @param workOrder
     */
    private async validateWorkOrderHasRequiredRelations(workOrder: DbRecordEntityTransform) {

        const { CONTACT, ADDRESS, ORDER_ITEM, SERVICE_APPOINTMENT } = SchemaModuleEntityTypeEnums;

        const workOrderAddress = workOrder[ADDRESS].dbRecords;
        const workOrderServiceApp = workOrder[SERVICE_APPOINTMENT].dbRecords;
        const workOrderItems = workOrder[ORDER_ITEM].dbRecords;
        const contact = workOrder[CONTACT].dbRecords;

        if(!contact) {
            throw new ExceptionType(400, 'please add a contact to the work order');
        }
        if(!workOrderItems) {
            throw new ExceptionType(400, 'please add order items to the work order');
        }
        if(!workOrderAddress) {
            throw new ExceptionType(400, 'please add an address to the work order');
        }
        if(!workOrderServiceApp) {
            throw new ExceptionType(400, 'please add an appointment');
        }
    }


    /**
     *
     * @param principal
     * @param recordId
     * @param requestBody
     */
    async validateStageChange(principal: OrganizationUserEntity, workOrderId: any, requestBody: any) {

        try {

            const workOrder = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                workOrderId,
                [ ORDER_ITEM, WORK_ORDER, ADDRESS, CONTACT, SERVICE_APPOINTMENT ],
            );
            const stage = await this.pipelineEntitysStagesService.getPipelineStageByOrganizationAndId(
                principal.organization,
                requestBody.stageId,
            );

            const workOrderOrderItems = workOrder[ORDER_ITEM].dbRecords;
            const serviceAppointment = workOrder[SERVICE_APPOINTMENT].dbRecords;

            console.log('validate stage change', stage);
            console.log('serviceAppointment', serviceAppointment);

            if(!stage.isDefault && !stage.isFail) {
                await this.validateWorkOrderHasRequiredRelations(workOrder);
            }

            // validate order items
            if(!workOrderOrderItems) {
                throw new ExceptionType(400, 'no order items on the work order, please add them');
            } else {

                // cannot move to any stage other then the following without a Service Appointment
                if(!stage.isFail && !stage.isDefault) {
                    if(!serviceAppointment) {
                        throw new ExceptionType(400, 'no service appointment is scheduled, please add one');
                    }
                }

                // Cannot move to success without devices scanned in
                if(stage.isSuccess && !stage.isFail) {
                    for(const orderItem of workOrderOrderItems) {

                        const item = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                            principal.organization,
                            orderItem.id,
                            [ PRODUCT, CUSTOMER_DEVICE_ONT, CUSTOMER_DEVICE_ROUTER ],
                        );

                        const productCategory = getPropertyFromRelation(item, PRODUCT, 'Category');
                        const productType = getPropertyFromRelation(item, PRODUCT, 'Type');

                        // Check that the ONT has values for the BROADBAND > BASE_PRODUCT
                        if(!item[CUSTOMER_DEVICE_ONT].dbRecords && productCategory === 'BROADBAND' && productType === 'BASE_PRODUCT') {
                            throw new ExceptionType(400, `No ONT added for order item ${item.title}`);
                        } else if(item[CUSTOMER_DEVICE_ONT].dbRecords && productCategory === 'BROADBAND' && productType === 'BASE_PRODUCT') {
                            // Verify ponSerialNumber
                            const serialNumber = getPropertyFromRelation(item, CUSTOMER_DEVICE_ONT, 'SerialNumber');

                            if(!serialNumber || serialNumber.length < 5) {
                                throw new ExceptionType(
                                    400,
                                    `ONT serial number empty or invalid for order item ${item.title}`,
                                );
                            }

                            // Verify ponPort
                            const ponPort = getPropertyFromRelation(item, CUSTOMER_DEVICE_ONT, 'PONPort');
                            if(!ponPort) {
                                throw new ExceptionType(
                                    400,
                                    `ONT PON number empty or invalid for order item ${item.title}`,
                                );
                            }
                        }

                        // Check that the router has values for any BROADBAND Products
                        if(!item[CUSTOMER_DEVICE_ROUTER].dbRecords && productCategory === 'BROADBAND') {
                            throw new ExceptionType(400, `No Router added for order item ${item.title}`);
                        } else if(item[CUSTOMER_DEVICE_ROUTER].dbRecords && productCategory === 'BROADBAND') {
                            // validate that order items have an router with a serial number
                            for(const router of item[CUSTOMER_DEVICE_ROUTER].dbRecords) {
                                const serialNumber = getPropertyFromRelation(
                                    item,
                                    CUSTOMER_DEVICE_ROUTER,
                                    'SerialNumber',
                                );
                                if(!serialNumber || serialNumber.length < 5) {
                                    throw new ExceptionType(
                                        400,
                                        `Router serial number empty or invalid for order item ${item.title} and router ${router.title}`,
                                    );
                                }
                            }
                        }
                    }
                }
                return true;
            }
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
    async provisionWorkOrderItemRequest(
        principal: OrganizationUserEntity,
        orderItemId: string,
    ): Promise<any> {
        try {

            // get the work order item from the url param
            const workOrderItem = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                orderItemId,
                [ PRODUCT, CUSTOMER_DEVICE_ONT, WORK_ORDER ],
            );

            const ontDevice = workOrderItem[CUSTOMER_DEVICE_ONT].dbRecords;
            const workOrders = workOrderItem[WORK_ORDER].dbRecords;

            if(!workOrders) {
                throw new ExceptionType(400, 'Please add this item to a work order before provisioning');
            }

            // get work order with order items
            const workOrder = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                workOrders[0].id,
                [ ADDRESS ],
            );

            const address = workOrder[ADDRESS].dbRecords;

            if(!ontDevice) {
                throw new ExceptionType(400, 'no ONT to prevision, please enter the device details');
            }
            // validate the item has all required fields
            await this.validateItemToProvision(principal, workOrderItem);

            console.log('itemToProvision', workOrderItem);

            // parse the text file script and email to @jeremy Chelot

            const {
                ontConfigTemplate,
                oltName,
                ponPort,
                serialNumber,
            } = this.parseTemplateWithParams(ontDevice[0], address[0]);


            await this.sendProvisionRequestEmail(
                principal,
                workOrder.id,
                'SENDGRID_WORK_ORDER_PROVISION_REQUEST',
                {
                    ontConfigTemplate,
                    oltName,
                    ponPort,
                    serialNumber,
                },
            );


            return {
                ontConfigTemplate,
                oltName,
                ponPort,
                serialNumber,
            };

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);

        }

    }

    /**
     *
     * @param principal
     * @param workOrderOrderItems
     * @private
     */
    private async validateItemToProvision(
        principal: OrganizationUserEntity,
        workOrderOrderItem: DbRecordEntityTransform,
    ) {

        // check that items exist
        if(!workOrderOrderItem) {
            throw new ExceptionType(400, 'no order item on the work order, please add them');
        }


        const productCategory = getPropertyFromRelation(workOrderOrderItem, PRODUCT, 'Category');

        // Check that the ONT has values
        if(!workOrderOrderItem[CUSTOMER_DEVICE_ONT].dbRecords && productCategory === 'BROADBAND') {
            throw new ExceptionType(400, `No ONT added for order item ${workOrderOrderItem.title}`);
        } else if(workOrderOrderItem[CUSTOMER_DEVICE_ONT].dbRecords && productCategory === 'BROADBAND') {
            // Verify ponSerialNumber
            const serialNumber = getPropertyFromRelation(workOrderOrderItem, CUSTOMER_DEVICE_ONT, 'SerialNumber');

            if(!serialNumber || serialNumber.length < 5) {
                throw new ExceptionType(
                    400,
                    `ONT serial number empty or invalid for order item ${workOrderOrderItem.title}`,
                );
            }

            // Verify ponPort
            const ponPort = getPropertyFromRelation(workOrderOrderItem, CUSTOMER_DEVICE_ONT, 'PONPort');
            if(!ponPort) {
                throw new ExceptionType(
                    400,
                    `ONT PON number empty or invalid for order item ${workOrderOrderItem.title}`,
                );
            }
        } else if(productCategory !== 'BROADBAND') {
            throw new ExceptionType(
                400,
                `cannot request provisioning for non broadband item ${workOrderOrderItem.title}`,
            );
        }
    }

    /**
     *
     * @param itemToProvision
     * @private
     */
    private parseTemplateWithParams(ontToProvision: DbRecordEntityTransform, address: DbRecordEntityTransform) {

        try {

            const oltName = getProperty(ontToProvision, 'OltName');
            const ponPort = getProperty(ontToProvision, 'PONPort');
            const serialNumber = getProperty(ontToProvision, 'SerialNumber');
            const fullAddress = getProperty(address, 'FullAddress');


            const ontConfigTemplate = `set evc-maps evc-map evc_map_channel-termination0/<PON>_101_<T-Cont>_<GEM>_<onu-id-long> scheduler root-if-name "channel-termination 0/<PON>"
            <br />
            set evc-maps evc-map evc_map_channel-termination0/<PON>_101_<T-Cont>_<GEM>_<onu-id-long> scheduler scheduler-node-name "Data-<onu-id-long>"
            <br/>
            set evc-maps evc-map evc_map_channel-termination0/<PON>_101_<T-Cont>_<GEM>_<onu-id-long> gem-port <GEM>
            <br/>
            set evc-maps evc-map evc_map_channel-termination0/<PON>_101_<T-Cont>_<GEM>_<onu-id-long> enabled true
            <br/>
            set evc-maps evc-map evc_map_channel-termination0/<PON>_101_<T-Cont>_<GEM>_<onu-id-long> evc evc_101
            <br/>
            set evc-maps evc-map evc_map_channel-termination0/<PON>_101_<T-Cont>_<GEM>_<onu-id-long> match-untagged false
            <br/>
            set evc-maps evc-map evc_map_channel-termination0/<PON>_101_<T-Cont>_<GEM>_<onu-id-long> inherit-pri
            <br/>
            set evc-maps evc-map evc_map_channel-termination0/<PON>_101_<T-Cont>_<GEM>_<onu-id-long> uni "channel-termination 0/<PON>"
            <br/>
            <br />
            set subscriber-profiles subscriber-profile dhcp_lineinsertion evc-map evc_map_channel-termination0/<PON>_101_<T-Cont>_<GEM>_<onu-id-long>
            <br/>
            <br />
            set xpon t-conts t-cont "<onu-id-long>-Data" alloc-id <T-Cont>
            <br/>
            set xpon t-conts t-cont "<onu-id-long>-Data" bandwidth-profile <bandwidth-profile>
            <br/>
            set xpon t-conts t-cont "<onu-id-long>-Data" xgem-ports data-xgem-ports data-xgem <GEM> cos 0
            <br/>
            set xpon t-conts t-cont "<onu-id-long>-Data" xgem-ports data-xgem-ports data-xgem <GEM> cos 1
            <br/>
            set xpon t-conts t-cont "<onu-id-long>-Data" xgem-ports data-xgem-ports data-xgem <GEM> cos 2
            <br/>
            set xpon t-conts t-cont "<onu-id-long>-Data" xgem-ports data-xgem-ports data-xgem <GEM> cos 3
            <br/>
            set xpon t-conts t-cont "<onu-id-long>-Data" xgem-ports data-xgem-ports data-xgem <GEM> cos 4
            <br/>
            set xpon t-conts t-cont "<onu-id-long>-Data" xgem-ports data-xgem-ports data-xgem <GEM> cos 5
            <br/>
            set xpon t-conts t-cont "<onu-id-long>-Data" xgem-ports data-xgem-ports data-xgem <GEM> cos 6
            <br/>
            set xpon t-conts t-cont "<onu-id-long>-Data" xgem-ports data-xgem-ports data-xgem <GEM> cos 7
            <br/>
            set xpon t-conts t-cont "<onu-id-long>-Data" xgem-ports data-xgem-ports data-xgem <GEM> encryption true
            <br/>
            set xpon t-conts t-cont "<onu-id-long>-Data" xgem-ports data-xgem-ports data-xgem <GEM> interface "<onu-id-long> subscriber"
            <br/>
            <br />
            set link-table link-table "<onu-id-long>" to-interface "<onu-id-long> subscriber"
            <br/>
            <br />
            set interfaces interface "channel-termination 0/<PON>" tm-root child-scheduler-nodes "scheduler-channel-pair <PON>" priority 0
            <br/>
            set interfaces interface "channel-termination 0/<PON>" tm-root child-scheduler-nodes "scheduler-channel-pair <PON>" weight 1
            <br/>
            set interfaces interface "channel-termination 0/<PON>" tm-root scheduler-node "scheduler-channel-pair <PON>" scheduler-type four-priority-strict-priority
            <br/>
            set interfaces interface "channel-termination 0/<PON>" tm-root scheduler-node "scheduler-channel-pair <PON>" child-scheduler-nodes "Data-<onu-id-long>" priority 2
            <br/>
            set interfaces interface "channel-termination 0/<PON>" tm-root scheduler-node "scheduler-channel-pair <PON>" child-scheduler-nodes "Data-<onu-id-long>" weight 0
            <br/>
            set interfaces interface "channel-termination 0/<PON>" tm-root scheduler-node "scheduler-channel-pair <PON>" scheduling-level 1
            <br/>
            set interfaces interface "channel-termination 0/<PON>" tm-root scheduler-node "Data-<onu-id-long>" scheduler-type four-priority-strict-priority
            <br/>
            set interfaces interface "channel-termination 0/<PON>" tm-root scheduler-node "Data-<onu-id-long>" tc-id-2-queue-id-mapping-profile-name "Scheduler tctoqueue Mapping"
            <br/>
            set interfaces interface "channel-termination 0/<PON>" tm-root scheduler-node "Data-<onu-id-long>" contains-queues true
            <br/>
            set interfaces interface "channel-termination 0/<PON>" tm-root scheduler-node "Data-<onu-id-long>" queue 0 priority 0
            <br/>
            set interfaces interface "channel-termination 0/<PON>" tm-root scheduler-node "Data-<onu-id-long>" queue 0 weight 1
            <br/>
            set interfaces interface "channel-termination 0/<PON>" tm-root scheduler-node "Data-<onu-id-long>" queue 1 priority 1
            <br/>
            set interfaces interface "channel-termination 0/<PON>" tm-root scheduler-node "Data-<onu-id-long>" queue 1 weight 1
            <br/>
            set interfaces interface "channel-termination 0/<PON>" tm-root scheduler-node "Data-<onu-id-long>" queue 2 priority 2
            <br/>
            set interfaces interface "channel-termination 0/<PON>" tm-root scheduler-node "Data-<onu-id-long>" queue 2 weight 1
            <br/>
            set interfaces interface "channel-termination 0/<PON>" tm-root scheduler-node "Data-<onu-id-long>" queue 3 priority 3
            <br/>
            set interfaces interface "channel-termination 0/<PON>" tm-root scheduler-node "Data-<onu-id-long>" queue 3 weight 1
            <br/>
            set interfaces interface "channel-termination 0/<PON>" tm-root scheduler-node "Data-<onu-id-long>" scheduling-level 2
            <br/>
            set interfaces interface "channel-termination 0/<PON>" tm-root scheduler-node "Data-<onu-id-long>" shaper-name "<shaper-name>"
            <br/>
            <br />
            set interfaces interface "onu 1101.<PID>.<onu-id>" performance enable true
            <br/>
            set interfaces interface "onu 1101.<PID>.<onu-id>" onu aes-mode-enable true
            <br/>
            set interfaces interface "onu 1101.<PID>.<onu-id>" onu assigned-tconts "<onu-id-long>-Data"
            <br/>
            set interfaces interface "onu 1101.<PID>.<onu-id>" onu channel-partition ChannelPartition_P<PID>
            <br/>
            set interfaces interface "onu 1101.<PID>.<onu-id>" onu expected-serial-number-string ${serialNumber}
            <br/>
            set interfaces interface "onu 1101.<PID>.<onu-id>" onu onu-id <onu-id>
            <br/>
            set interfaces interface "onu 1101.<PID>.<onu-id>" onu preferred-channel-pair "channel-pair 1101.<PID>.15"
            <br/>
            set interfaces interface "onu 1101.<PID>.<onu-id>" enabled true
            <br/>
            set interfaces interface "onu 1101.<PID>.<onu-id>" type adtn-xp:xpon-onu
            <br/>
            set interfaces interface "onu 1101.<PID>.<onu-id>" description "<onu-id-long> - ${fullAddress}"
            <br/>
            <br/>
            set interfaces interface onu-subscr-if-1101.<PID>.<onu-id>.0.eth.1.phy ethernet phy auto-negotiation enable true
            <br/>
            set interfaces interface onu-subscr-if-1101.<PID>.<onu-id>.0.eth.1.phy ethernet phy duplex full
            <br/>
            set interfaces interface onu-subscr-if-1101.<PID>.<onu-id>.0.eth.1.phy ethernet phy speed 1.000
            <br/>
            set interfaces interface onu-subscr-if-1101.<PID>.<onu-id>.0.eth.1.phy performance enable true
            <br/>
            set interfaces interface onu-subscr-if-1101.<PID>.<onu-id>.0.eth.1.phy enabled true
            <br/>
            set interfaces interface onu-subscr-if-1101.<PID>.<onu-id>.0.eth.1.phy type ianaift:ethernetCsmacd
            <br/>
            set interfaces interface onu-subscr-if-1101.<PID>.<onu-id>.0.eth.1.phy description "<onu-id-long> - 621i Port 1"
            <br/>
            <br/>
            set interfaces interface "<onu-id-long>" subif-lower-layer interface onu-subscr-if-1101.<PID>.<onu-id>.0.eth.1.phy
            <br/>
            set interfaces interface "<onu-id-long>" enabled true
            <br/>
            set interfaces interface "<onu-id-long>" type adtn-bbfift:vlan-sub-interface
            <br/>
            set interfaces interface "<onu-id-long> subscriber" olt-v-enet lower-layer-interface "onu 1101.<PID>.<onu-id>"
            <br/>
            set interfaces interface "<onu-id-long> subscriber" enabled true
            <br/>
            set interfaces interface "<onu-id-long> subscriber" type adtn-xp:xpon-olt-v-enet`;


            console.log({ oltName, ponPort, serialNumber });

            return {
                ontConfigTemplate,
                oltName,
                ponPort,
                serialNumber,
            };

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

            await this.validateWorkOrderHasRequiredRelations(workOrder);

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
