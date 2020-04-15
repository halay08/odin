import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { SendgridEmailEntity } from '@d19n/models/dist/notifications/sendgrid/email/sendgrid.email.entity';
import { SUB_CANCEL, SUB_SEND_DYNAMIC_EMAIL } from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import { DbRecordAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/association/dto/db.record.association.create.update.dto';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { IDbRecordCreateUpdateRes } from '@d19n/models/dist/schema-manager/db/record/interfaces/interfaces';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty, getPropertyFromRelation } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { DbService } from '@d19n/schema-manager/dist/db/db.service';
import { DbRecordsAssociationsService } from '@d19n/schema-manager/dist/db/records/associations/db.records.associations.service';
import { DbRecordsService } from '@d19n/schema-manager/dist/db/records/db.records.service';
import { PipelineEntitysStagesService } from '@d19n/schema-manager/dist/pipelines/stages/pipelines.stages.service';
import { SchemasService } from '@d19n/schema-manager/dist/schemas/schemas.service';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as moment from 'moment';
import { OrderCalculations } from '../helpers/OrderCalculations';
import { OrdersItemsService } from './items/orders.items.service';
import { ProcessOrderBillingDto } from './types/ProcessOrderBillingDto';

dotenv.config();

const { ORDER_MODULE, FIELD_SERVICE_MODULE, NOTIFICATION_MODULE } = SchemaModuleTypeEnums;
const { ORDER, WORK_ORDER } = SchemaModuleEntityTypeEnums;

@Injectable()
export class OrdersService {

    private schemasService: SchemasService;
    private dbService: DbService;
    private dbRecordsService: DbRecordsService;
    private dbRecordsAssociationsService: DbRecordsAssociationsService;
    private ordersItemsService: OrdersItemsService;
    private pipelineEntitysStagesService: PipelineEntitysStagesService;
    private amqpConnection: AmqpConnection;

    constructor(
        @Inject(forwardRef(() => OrdersItemsService)) ordersItemsService: OrdersItemsService,
        dbRecordsAssociationsService: DbRecordsAssociationsService,
        dbService: DbService,
        schemasService: SchemasService,
        dbRecordsService: DbRecordsService,
        pipelineEntitysStagesService: PipelineEntitysStagesService,
        amqpConnection: AmqpConnection,
    ) {
        this.schemasService = schemasService;
        this.dbService = dbService;
        this.dbRecordsService = dbRecordsService;
        this.dbRecordsAssociationsService = dbRecordsAssociationsService;
        this.ordersItemsService = ordersItemsService;
        this.pipelineEntitysStagesService = pipelineEntitysStagesService;
        this.amqpConnection = amqpConnection;
    }


    /**
     *
     * @param principal
     * @param orderId
     * @param discountId
     * @param headers
     */
    public async addDiscountByPrincipal(
        principal: OrganizationUserEntity,
        orderId: string,
        relatedDiscountId: string,
    ): Promise<IDbRecordCreateUpdateRes> {
        try {

            const discount = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                relatedDiscountId,
                [],
            );

            const update: DbRecordCreateUpdateDto = {
                entity: `${ORDER_MODULE}:${ORDER}`,
                properties: {
                    DiscountValue: discount.properties['DiscountValue'],
                    DiscountType: discount.properties['DiscountType'],
                    DiscountUnit: discount.properties['DiscountUnit'],
                    DiscountLength: discount.properties['DiscountLength'],
                    TrialUnit: discount.properties['TrialUnit'],
                    TrialLength: discount.properties['TrialLength'],
                },
            };

            await this.dbService.updateDbRecordsByPrincipalAndId(principal, orderId, update);
            return await this.computeOrderTotals(principal, orderId);

        } catch (e) {
            throw new ExceptionType(e.statusCode, e.message);
        }
    }

    /**
     *
     * @param principal
     * @param orderId
     * @param headers
     */
    public async removeDiscountByPrincipal(
        principal: OrganizationUserEntity,
        orderId: string,
    ): Promise<IDbRecordCreateUpdateRes> {
        try {
            await this.dbService.updateDbRecordsByPrincipalAndId(principal, orderId, {
                entity: `${ORDER_MODULE}:${ORDER}`,
                properties: {
                    DiscountValue: 0,
                    DiscountType: 'AMOUNT',
                    DiscountUnit: 'MONTHS',
                    DiscountLength: 0,
                    TrialUnit: 'MONTHS',
                    TrialLength: 0,
                },
            });
            return await this.computeOrderTotals(principal, orderId);
        } catch (e) {
            throw new ExceptionType(e.statusCode, e.message);
        }
    }

    /**
     * Update a records stage
     * @param principal
     * @param orderId
     * @param requestBody
     * @param headers
     */
    public async handleStageChange(
        principal: OrganizationUserEntity,
        orderId: string,
        requestBody: DbRecordCreateUpdateDto,
    ) {
        try {
            // replace with get stage and use the stage entity which will contain rules
            const order = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                orderId,
                [ WORK_ORDER ],
            );

            if(order.stage && order.stage.key === 'OrderStagePreOrder') {
                await this.sendOrderEmail(principal, orderId, 'SENDGRID_ORDER_CONFIRMATION');
            }

            if(order.stage && order.stage.key === 'OrderStageSold') {
                await this.sendOrderEmail(principal, orderId, 'SENDGRID_ORDER_CONFIRMATION');
                await this.sendOrderEmail(principal, order.id, 'SENDGRID_INSTALL_SCHEDULING_REQUEST');
            }

            if(order.stage && order.stage.key === 'OrderStageActive') {
                const update = new DbRecordCreateUpdateDto();
                update.entity = 'OrderModule:Order';
                update.properties = {
                    ActivationStatus: 'CLOSED',
                    ActiveDate: moment().utc().format('YYYY-MM-DD'),
                };

                await this.dbService.updateDbRecordsByPrincipalAndId(principal, orderId, update);

                await this.processOrderForBilling(
                    principal,
                    orderId,
                    {
                        BillingStartDate: getProperty(order, 'BillingStartDate') || moment().utc().format('YYYY-MM-DD'),
                        ContractStartDate: getProperty(
                            order,
                            'ContractStartDate',
                        ) || moment().utc().format('YYYY-MM-DD'),
                    },
                );
            }

            if(order.stage && order.stage.key === 'OrderStageCancelled') {
                const update = new DbRecordCreateUpdateDto();
                update.entity = 'OrderModule:Order';
                update.properties = {
                    CancelledDate: moment().utc().format('YYYY-MM-DD'),
                };
                await this.dbService.updateDbRecordsByPrincipalAndId(principal, orderId, update);
                // check for work orders
                if(order[WORK_ORDER].dbRecords) {
                    for(const workOrder of order[WORK_ORDER].dbRecords) {
                        this.amqpConnection.publish(
                            FIELD_SERVICE_MODULE,
                            `${FIELD_SERVICE_MODULE}.${WORK_ORDER}.${SUB_CANCEL}`,
                            {
                                principal,
                                workOrderId: workOrder.id,
                            },
                        )
                    }
                }

            }

            return order;
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
    public async processOrderForBilling(
        principal: OrganizationUserEntity,
        orderId: string,
        body: ProcessOrderBillingDto,
    ) {
        try {
            const { ORDER_ITEM } = SchemaModuleEntityTypeEnums;

            const order = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                orderId,
                [ ORDER_ITEM ],
            );

            // compute the contract end date from the base product contract length
            const { contractEndDate, contractType } = await this.computeContractEndDate(
                principal,
                body.ContractStartDate,
                order[ORDER_ITEM].dbRecords,
            );

            const update = new DbRecordCreateUpdateDto();
            update.entity = `${ORDER_MODULE}:${ORDER}`;
            update.properties = {
                BillingStartDate: body.BillingStartDate,
                ContractStartDate: body.ContractStartDate,
                ContractEndDate: contractEndDate,
                ContractType: contractType,
                ContractRenewalCount: this.setContractRenewalCount(order, contractEndDate),
            };
            await this.dbService.updateDbRecordsByPrincipalAndId(principal, orderId, update);

            if(order[ORDER_ITEM].dbRecords) {
                const orderItemIds = order[ORDER_ITEM].dbRecords.map(elem => elem.id);

                await this.ordersItemsService.processOrderItemsForBilling(
                    principal,
                    orderId,
                    orderItemIds,
                );
            }


            return this.computeOrderTotals(principal, orderId);

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }


    /**
     *  This will adjust discount periods / free periods and taxes for an order.
     * @param principal
     * @param orderId
     * @param headers
     */
    public async computeOrderTotals(
        principal: OrganizationUserEntity,
        orderId: string,
    ): Promise<IDbRecordCreateUpdateRes> {
        try {
            const { ORDER_ITEM } = SchemaModuleEntityTypeEnums;

            const order = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                orderId,
                [ ORDER_ITEM ],
            );

            const orderItems = order[ORDER_ITEM].dbRecords;

            let update;
            if(!orderItems) {
                update = {
                    schemaId: order.schemaId,
                    properties: {
                        Subtotal: '0.00',
                        TotalDiscounts: '0.00',
                        TotalTaxAmount: '0.00',
                        TotalPrice: '0.00',
                    },
                };
            } else {
                update = {
                    schemaId: order.schemaId,
                    properties: {
                        Subtotal: OrderCalculations.computeOrderSubtotal(orderItems),
                        TotalDiscounts: OrderCalculations.computeOrderTotalDiscounts(orderItems, order),
                        TotalTaxAmount: OrderCalculations.computeOrderTotalTax(orderItems, order),
                        TotalPrice: OrderCalculations.computeTotalDue(orderItems, order),
                    },
                }
            }

            return await this.dbService.updateDbRecordsByPrincipalAndId(principal, orderId, update);

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }

    /**
     * templateLabels:
     * SENDGRID_ORDER_CONFIRMATION
     *
     * @param principal
     * @param orderId
     * @paramtemplateLabel
     * @param headers
     * @param body
     */
    public async sendOrderEmail(
        principal: OrganizationUserEntity,
        orderId: string,
        templateLabel: string,
        body?: SendgridEmailEntity,
    ): Promise<any> {
        try {
            const { CONTACT, ORDER_ITEM, ADDRESS } = SchemaModuleEntityTypeEnums;

            await this.computeOrderTotals(principal, orderId);

            const order = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                orderId,
                [ CONTACT, ORDER_ITEM, ADDRESS ],
            );
            await this.validatedEmail(order);

            const contactEmailAddress = getPropertyFromRelation(order, CONTACT, 'EmailAddress');
            const contactFirstName = getPropertyFromRelation(order, CONTACT, 'FirstName');

            const newEmail = new SendgridEmailEntity();
            newEmail.to = contactEmailAddress;
            newEmail.from = principal.organization.billingReplyToEmail;
            newEmail.templateLabel = templateLabel;
            newEmail.dynamicTemplateData = Object.assign({}, {
                recordId: orderId,
                recordNumber: order.recordNumber,
                contactFirstName: contactFirstName,
                subject: this.createEmailSubject(order),
                orderItems: order[ORDER_ITEM].dbRecords.map(elem => ({
                    lineItemName: elem.title,
                    lineItemDescription: getProperty(elem, 'Description'),
                    lineItemTotal: getProperty(elem, 'UnitPrice'),
                })),
                orderSummary: {
                    subtotal: getProperty(order, 'Subtotal'),
                    totalDiscount: getProperty(order, 'TotalDiscounts') && getProperty(
                        order,
                        'TotalDiscounts',
                    ) !== '0.00' ? getProperty(order, 'TotalDiscounts') : null,
                    totalTax: getProperty(order, 'TotalTaxAmount') && getProperty(
                        order,
                        'TotalTaxAmount',
                    ) !== '0.00' ? getProperty(order, 'TotalTaxAmount') : null,
                    totalDue: getProperty(order, 'TotalPrice'),
                },
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
     * @param principal
     * @param orderId
     * @param requestBody
     * @param headers
     */
    public async validateStageChange(
        principal: OrganizationUserEntity,
        orderId: string,
        requestBody: DbRecordCreateUpdateDto,
    ) {
        try {
            const { PRODUCT, ORDER_ITEM, WORK_ORDER, ADDRESS, CONTACT } = SchemaModuleEntityTypeEnums;

            const order = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                orderId,
                [ ORDER_ITEM, WORK_ORDER, ADDRESS, CONTACT ],
            );
            const stage = await this.pipelineEntitysStagesService.getPipelineStageByOrganizationAndId(
                principal.organization,
                requestBody.stageId,
            );

            const orderAddress = order[ADDRESS].dbRecords;
            const orderOrderItems = order[ORDER_ITEM].dbRecords;
            const orderWorkOrders = order[WORK_ORDER].dbRecords;
            const orderContact = order[CONTACT].dbRecords;

            // Do not allow a user to move an order out of the back from the success stage.
            // Only to the fail stage.
            if(order.stage.isSuccess && !stage.isFail) {
                throw new ExceptionType(400, 'an order can only be moved to cancelled after being active');
            }

            // Do not allow an order to be moved from the fail stage
            if(order.stage.isFail && !stage.isFail) {
                throw new ExceptionType(400, 'an order can not be moved from cancelled');
            }

            if(!stage.isFail && !stage.isDefault) {

                if(!orderOrderItems) {
                    throw new ExceptionType(400, 'no order items on the order, cannot move to active');
                }

                for(const orderItem of orderOrderItems) {

                    const orderItemWithProduct = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                        principal.organization,
                        orderItem.id,
                        [ PRODUCT ],
                    );

                    const products = orderItemWithProduct[PRODUCT].dbRecords;

                    // Check if all the products on the order are Available
                    if(!products) {
                        throw new ExceptionType(
                            400,
                            `Order item ${orderItem.title} is missing a product`,
                        );
                    } else {
                        // TODO Auto split orders at checkout if there is a product not yet available
                        // TODO Move that split order into Pre Orders
                        // TODO Move the regular order into the correct stage based on the status of the premise
                        // TODO This is a catch all to prevent orders from being billing when the product is not

                        if([ 'OrderStageActive' ].includes(stage.key)) {
                            for(const product of products) {
                                const availableFrom = getProperty(product, 'AvailableFrom');
                                const availableTo = getProperty(product, 'AvailableTo');

                                // Is the available from date in the future
                                if(availableFrom && moment(availableFrom).isAfter(moment().utc().format('YYYY-MM-DD'))) {
                                    throw new ExceptionType(
                                        400,
                                        `${product.title} is not available until ${availableFrom}. Split this item ont a new order.`,
                                    );
                                }

                                // is the available to date before today
                                if(availableTo && moment(availableTo).isBefore(moment().utc().format('YYYY-MM-DD'))) {
                                    throw new ExceptionType(
                                        400,
                                        `${product.title} expired on ${availableTo}. Remove it from the order`,
                                    );
                                }
                            }
                        }
                    }
                }

                // Validate Address
                // Before moving to Sold the order needs to have an address with the correct sales status
                if(orderAddress && orderAddress[0]) {
                    if([ 'OrderStageSold', 'OrderStageSupply', 'OrderStageActive' ].includes(stage.key)) {
                        const salesStatus = getProperty(orderAddress[0], 'SalesStatus');
                        if(salesStatus !== 'ORDER') {
                            throw new ExceptionType(
                                400,
                                `the address has a sales status of ${salesStatus} and it needs to be set to ORDER before moving to ${stage.name}`,
                            );
                        }
                    }
                } else {
                    throw new ExceptionType(
                        400,
                        `the order is missing an address, please add one before moving to Sold`,
                    );
                }

                // Validate the order has a Contact
                if([ 'OrderStageSold', 'OrderStageSupply', 'OrderStageActive' ].includes(stage.key)) {
                    if(!orderContact) {
                        throw new ExceptionType(
                            400,
                            `the order is missing a contact, please add one before moving to ${stage.name}`,
                        );
                    }
                }

                // Validate Work Orders
                if([ 'OrderStageSupply' ].includes(stage.key)) {

                    // Before moving an order to Supply, the Work Order needs to be in the scheduled stage
                    if(!orderWorkOrders) {
                        throw new ExceptionType(
                            400,
                            `the order is missing a work order, please create one before moving to Supply`,
                        );
                    }
                    //  validate the work order is scheduled
                    for(const workOrder of orderWorkOrders) {
                        const workOrderType = getProperty(workOrder, 'Type');
                        if(workOrderType === 'INSTALL' && workOrder.stage.key !== 'WorkOrderStageScheduled') {
                            throw new ExceptionType(
                                400,
                                'The work order is not scheduled.',
                            );
                        }
                    }
                }


                if([ 'OrderStageActive' ].includes(stage.key)) {
                    // Before moving an order to Active the install work order must be Done.
                    //  validate work orders
                    if(orderWorkOrders) {
                        // Check if the install work order is active
                        const activeInstallWorkOrders = orderWorkOrders.find(elem => {
                            return elem.stage.isSuccess && getProperty(elem, 'Type') === 'INSTALL'
                        });

                        if(!activeInstallWorkOrders) {
                            throw new ExceptionType(
                                400,
                                'This order has an install work order in progress, complete the work order before moving to active.',
                            );
                        }
                    }
                }
            }

            return true;

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }

    /**
     *
     * @param order
     */
    private async validatedEmail(order: DbRecordEntityTransform) {

        const { CONTACT, ORDER_ITEM } = SchemaModuleEntityTypeEnums;

        const orderContact = order[CONTACT].dbRecords;
        const orderItems = order[ORDER_ITEM].dbRecords;

        if(!getProperty(order, 'TotalPrice')) {
            throw new ExceptionType(400, 'order total price is null, cannot send confirmation');
        }
        // Contact
        if(!orderContact) {
            throw new ExceptionType(400, 'no contact on the order, cannot send confirmation');
        }
        // Items
        if(!orderItems) {
            throw new ExceptionType(400, 'no order items on the order, cannot send confirmation');
        }
    }

    /**
     *
     * @param order
     * @private
     */
    private createEmailSubject(order: DbRecordEntityTransform) {

        if(order.stage.key === 'OrderStagePreOrder') {
            return 'Your YouFibre Pre Order Confirmation';
        } else if(order.stage.key === 'OrderStageSold') {
            return 'Your YouFibre Order Confirmation';
        }
    }


    /**
     *
     * @param principal
     * @param projectId
     * @param body
     */
    public async handleOrderWorkOrderStageChange(
        principal: OrganizationUserEntity,
        workOrderId: string,
        body: DbRecordCreateUpdateDto,
    ) {
        try {
            // Get the service appointment work order
            const workOrder = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                workOrderId,
                [ ORDER ],
            );

            // get the work order records
            const relatedOrders = workOrder[ORDER].dbRecords;

            if(relatedOrders) {
                if(workOrder.stage.key === 'WorkOrderStageScheduled') {
                    // Update the work order stage
                    const stageKey = 'OrderStageSupply';
                    const order = relatedOrders[0];
                    if(!order.stage.isSuccess && !order.stage.isFail && order.stage.key !== stageKey) {
                        await this.changeOrderStage(principal, order.id, stageKey);
                    }
                }
            }

            return;

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
    public async changeOrderStage(principal: OrganizationUserEntity, orderId: string, stageKey: string) {

        try {
            const stage = await this.pipelineEntitysStagesService.getPipelineAndStagesByStageKey(
                principal.organization,
                stageKey,
            );
            const updateDto = new DbRecordCreateUpdateDto();
            updateDto.entity = `${ORDER_MODULE}:${ORDER}`;
            updateDto.stageId = stage.id;

            const res = await this.dbService.updateDbRecordsByPrincipalAndId(principal, orderId, updateDto);

            return res;
        } catch (e) {
            console.error(e);

            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }

    /**
     * Handle address updated events and move the orders between stages
     * @param principal
     * @param addressId
     * @param body
     */
    async handleAddressUpdated(principal: OrganizationUserEntity, addressId: string, body: DbRecordCreateUpdateDto) {

        try {
            // Get the service appointment work order
            const address = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                addressId,
                [ ORDER ],
            );

            const addressSalesStatus = getProperty(address, 'SalesStatus');

            if(addressSalesStatus === 'ORDER') {
                // move all the pre orders to order stage
                const relatedRecords = address[ORDER].dbRecords;
                if(relatedRecords) {
                    for(const order of relatedRecords) {
                        // If the order is in the Pre Order stage move it to Sold
                        if(order.stage.key === 'OrderStagePreOrder') {
                            const stageKey = 'OrderStageSold';
                            await this.changeOrderStage(principal, order.id, stageKey);
                        }
                    }
                }
            } else if(addressSalesStatus === 'PRE_ORDER') {
                // move all the orders to the pre stage
                const relatedRecords = address[ORDER].dbRecords;
                if(relatedRecords) {
                    for(const order of relatedRecords) {
                        // If the order is in the Order stage move it back to PreOrder
                        if(order.stage.key === 'OrderStageSold') {
                            const stageKey = 'OrderStagePreOrder';
                            await this.changeOrderStage(principal, order.id, stageKey);
                        }
                    }
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * If an order needs to have the line items split into two orders
     * @param principal
     * @param orderId
     * @param body
     */
    async splitOrder(
        principal: OrganizationUserEntity,
        orderId: string,
        body: DbRecordAssociationCreateUpdateDto[],
    ): Promise<IDbRecordCreateUpdateRes> {

        try {
            const { ORDER_ITEM, CONTACT, ACCOUNT, ADDRESS, DISCOUNT, WORK_ORDER } = SchemaModuleEntityTypeEnums;

            const order = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                orderId,
                [ ORDER_ITEM, CONTACT, ADDRESS, ACCOUNT, DISCOUNT, WORK_ORDER ],
            );

            const contactRecords = order[CONTACT].dbRecords;
            const addressRecords = order[ADDRESS].dbRecords;
            const accountRecords = order[ACCOUNT].dbRecords;
            const discountRecords = order[DISCOUNT].dbRecords;
            const orderItemRecords = order[ORDER_ITEM].dbRecords;
            const workOrderRecords = order[WORK_ORDER].dbRecords;

            const orderItemsToSplit = orderItemRecords.filter(elem => body.map(obj => obj.recordId).includes(elem.id));

            if(orderItemsToSplit && orderItemsToSplit.length < 1) {
                throw new ExceptionType(409, 'No order items to split');
            }

            await this.verifyIfOrderItemExistsOnWorkOrder(principal, workOrderRecords, orderItemsToSplit);


            // Create a new Order with all the order associations (no work order)
            const orderCreate = new DbRecordCreateUpdateDto();
            orderCreate.entity = `${SchemaModuleTypeEnums.ORDER_MODULE}:${SchemaModuleEntityTypeEnums.ORDER}`;
            orderCreate.title = order.title;
            orderCreate.properties = order.properties;
            orderCreate.associations = [
                {
                    recordId: addressRecords ? addressRecords[0].id : undefined,
                },
                {
                    recordId: contactRecords ? contactRecords[0].id : undefined,
                },
                {
                    recordId: accountRecords ? accountRecords[0].id : undefined,
                },
                {
                    recordId: discountRecords ? discountRecords[0].id : undefined,
                },
                ...body,
            ];
            // create the new split order
            const orderCreateRes = await this.dbService.updateOrCreateDbRecordsByPrincipal(
                principal,
                [ orderCreate ],
                { upsert: true },
            );
            const newOrder = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                orderCreateRes[0].id,
                [],
            );

            // Record the order was split using a split order entry
            const newSplitOrderEntry = new DbRecordCreateUpdateDto();
            newSplitOrderEntry.entity = `${SchemaModuleTypeEnums.ORDER_MODULE}:SplitOrder`;
            newSplitOrderEntry.title = newOrder.recordNumber + '- SPLIT';
            newSplitOrderEntry.properties = {
                Description: `order ${order.recordNumber} has items that have been split to order ${newOrder.recordNumber}`,
            }
            newSplitOrderEntry.associations = [
                {
                    recordId: newOrder.id,
                },
                ...body,
            ];
            const splitOrderEntryCreate = await this.dbService.updateOrCreateDbRecordsByPrincipal(
                principal,
                [ newSplitOrderEntry ],
                { upsert: true },
            );

            const splitOrderEntry = splitOrderEntryCreate[0];

            // remove the order items from the original order
            for(const item of orderItemsToSplit) {
                await this.dbRecordsAssociationsService.deleteRelatedRecordById(
                    principal,
                    item.dbRecordAssociation.id,
                );
                // update order item to split, reset any billing fields
            }

            // create the new split order
            const orderUpdate = {
                entity: 'OrderModule:Order',
                associations: [
                    {
                        recordId: splitOrderEntry.id,
                    },
                ],
            }
            await this.dbService.updateDbRecordsByPrincipalAndId(principal, order.id, orderUpdate);

            // calculate the new order totals
            await Promise.all([
                this.computeOrderTotals(principal, order.id),
                this.computeOrderTotals(principal, newOrder.id),
            ]);

            return splitOrderEntry;

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }

    }

    /**
     *
     * @param principal
     * @param workOrderRecords
     * @param orderItemsToSplit
     * @private
     */
    private async verifyIfOrderItemExistsOnWorkOrder(
        principal: OrganizationUserEntity,
        workOrderRecords: DbRecordEntityTransform[],
        orderItemsToSplit: DbRecordEntityTransform[],
    ) {
        if(workOrderRecords) {
            for(const workOrder of workOrderRecords) {
                for(const orderItem of orderItemsToSplit) {
                    const association = await this.dbRecordsAssociationsService.getRelatedRecordByParentAndChildId(
                        principal.organization,
                        workOrder.id,
                        orderItem.id,
                    );
                    if(association) {
                        throw new ExceptionType(
                            409,
                            `order item ${orderItem.title} exists on a work order, please remove it before splitting the order`,
                        );
                    }
                }
            }
        }
    }

    /**
     *
     * @param principal
     * @param dbRecords
     * @private
     */
    private async computeContractEndDate(
        principal: OrganizationUserEntity,
        contractStartDate: string,
        orderItems: DbRecordEntityTransform[],
    ) {
        if(orderItems) {

            let contractEndDate;
            let contractType;


            // try to get the base broadband service
            let orderItem = orderItems.find(elem => getProperty(
                elem,
                'ProductCategory',
            ) === 'BROADBAND' && getProperty(elem, 'ProductType') === 'BASE_PRODUCT');

            // otherwise get the base voice service
            if(!orderItem) {
                orderItem = orderItems.find(elem => getProperty(
                    elem,
                    'ProductCategory',
                ) === 'VOICE' && getProperty(elem, 'ProductType') === 'BASE_PRODUCT');
            }

            // We need to check for ADD_ON_PRODUCTS in the event the order is just for add on items and
            // the base product exists on a different order.
            // get the addon broadband product
            if(!orderItem) {
                orderItem = orderItems.find(elem => getProperty(
                    elem,
                    'ProductCategory',
                ) === 'BROADBAND' && getProperty(elem, 'ProductType') === 'ADD_ON_PRODUCT');
            }

            // get the addon voice product
            if(!orderItem) {
                orderItem = orderItems.find(elem => getProperty(
                    elem,
                    'ProductCategory',
                ) === 'VOICE' && getProperty(elem, 'ProductType') === 'ADD_ON_PRODUCT');
            }

            if(orderItem) {

                // get the product for contract details
                const product = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                    principal.organization,
                    getProperty(orderItem, 'ProductRef'),
                    [],
                );

                contractType = getProperty(product, 'ContractType');
                const intervalUnit = getProperty(product, 'IntervalUnit');

                if(contractType) {
                    // MONTHLY and NONE are the only two options for Product ContractType that do not have a
                    // value i.e IntervalUnit_Value
                    if(contractType === 'MONTHLY') {

                        let diffInPast = moment().diff(contractStartDate, 'months');

                        if(diffInPast < 1) {
                            diffInPast = 1;
                        }

                        contractEndDate = moment(contractStartDate).add(diffInPast, intervalUnit).format('YYYY-MM-DD');

                        const isInThePast = moment(contractEndDate).isBefore(moment());

                        // if this date is still in the past add 1 month
                        if(isInThePast) {
                            contractEndDate = moment(contractEndDate).add(
                                diffInPast,
                                intervalUnit,
                            ).format('YYYY-MM-DD');
                        }

                    } else if(contractType === 'NONE') {

                        contractEndDate = moment(contractStartDate).add(0, intervalUnit).format('YYYY-MM-DD');

                    } else {

                        const split = contractType.split('_');
                        const length = split[1];

                        console.log('contractStartDate', contractStartDate);

                        const endDate = moment(contractStartDate).add(
                            Number(length),
                            intervalUnit,
                        ).format('YYYY-MM-DD');

                        console.log('endDate', endDate);

                        console.log('isBefore', moment(endDate).isBefore(moment().utc().format('YYYY-MM-DD')));

                        if(moment(endDate).isBefore(moment().utc().format('YYYY-MM-DD'))) {

                            contractEndDate = moment().utc().add(Number(length), intervalUnit).format('YYYY-MM-DD')

                        } else {

                            contractEndDate = endDate

                        }
                    }

                }
            }

            console.log('contractEndDate', contractEndDate)

            return { contractEndDate, contractType };
        }
    }

    /**
     *
     * @param order
     * @private
     */
    private setContractRenewalCount(order: DbRecordEntityTransform, nextContractEndDate: string) {

        console.log('order', order);

        const contractEndDate = getProperty(order, 'ContractEndDate');
        const contractRenewalCount = getProperty(order, 'ContractRenewalCount');

        console.log('contractEndDate', contractEndDate);

        if(contractEndDate) {

            const isInThePast = moment(contractEndDate).isBefore(nextContractEndDate);

            console.log('nextContractEndDate', nextContractEndDate);
            console.log('isInThePast', isInThePast);
            console.log('contractRenewalCount', contractRenewalCount);
            console.log('countAsNum', Number(contractRenewalCount));
            console.log('less than 1', Number(contractRenewalCount) < 1);

            if(isInThePast && contractRenewalCount && Number(contractRenewalCount)) {

                return contractRenewalCount + 1;

            } else if(isInThePast) {

                return 1;

            } else if(Number(contractRenewalCount) < 1) {
                console.log('SHOULD NOT BE HERE 1')

                return 0;

            }

            return contractRenewalCount;

        } else {

            console.log('SHOULD NOT BE HERE 2')

            return 0;
        }
    }


    /**
     * TODO: handleOrderContractRenewal
     * @private
     */
    private handleOrderContractRenewal() {
        // We need to increment the contract renewal count
        // We need to adjust the contractStartDate to be the date of the renwal
    }
}
