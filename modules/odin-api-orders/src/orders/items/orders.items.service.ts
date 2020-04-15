import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
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
import { SchemasService } from '@d19n/schema-manager/dist/schemas/schemas.service';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { CreateOrderItemFromProduct } from '../../helpers/CreateOrderItemFromProduct';
import { OrderItemCalculations } from '../../helpers/OrderItemCalculations';
import { OrdersService } from '../orders.service';
import moment = require('moment');

dotenv.config();

const { ORDER_MODULE } = SchemaModuleTypeEnums;
const { ORDER } = SchemaModuleEntityTypeEnums;

@Injectable()
export class OrdersItemsService {

    private schemasService: SchemasService;
    private dbRecordsService: DbRecordsService;
    private dbRecordsAssociationsService: DbRecordsAssociationsService;
    private dbService: DbService;
    private ordersService: OrdersService;

    constructor(
        schemasService: SchemasService,
        dbRecordsService: DbRecordsService,
        @Inject(forwardRef(() => DbRecordsAssociationsService)) dbRecordsAssociationsService: DbRecordsAssociationsService,
        @Inject(forwardRef(() => DbService)) dbService: DbService,
        @Inject(forwardRef(() => OrdersService)) ordersService: OrdersService,
    ) {

        this.schemasService = schemasService;
        this.dbService = dbService;
        this.dbRecordsService = dbRecordsService;
        this.dbRecordsAssociationsService = dbRecordsAssociationsService;
        this.ordersService = ordersService;
    }


    /**
     *
     * @param principal
     * @param orderItemId
     * @param body
     */
    public async amendOrderItemProductById(
        principal: OrganizationUserEntity,
        orderItemId: string,
        body: DbRecordAssociationCreateUpdateDto,
    ): Promise<IDbRecordCreateUpdateRes> {
        try {
            const { ORDER, PRODUCT } = SchemaModuleEntityTypeEnums;

            const orderItem = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                orderItemId,
                [ ORDER, PRODUCT ],
            );

            const order = orderItem[ORDER].dbRecords[0];
            const existingProducts = orderItem[PRODUCT].dbRecords;

            // Get new product
            const product = await this.dbRecordsAssociationsService.getRelatedRecordById(
                principal.organization,
                {
                    recordId: body.recordId,
                    dbRecordAssociationId: body.relatedAssociationId,
                },
            );

            // TODO: Validate changes against work orders

            // TODO: Validate changes against invoices

            // TODO: Create order amendment entity with details of the amendment

            // TODO: Track whether this is an Upgrade / Downgrade

            // Delete current product association
            if(existingProducts) {
                await this.dbRecordsAssociationsService.deleteRelatedRecordById(
                    principal,
                    existingProducts[0].dbRecordAssociation.id,
                );
            }

            // Updated order item and add a new association
            const OrderItemUpdate = {
                entity: `${SchemaModuleTypeEnums.ORDER_MODULE}:${SchemaModuleEntityTypeEnums.ORDER_ITEM}`,
                title: getProperty(product, 'DisplayName') || product.title,
                properties: {
                    ...CreateOrderItemFromProduct.construct(product, getProperty(orderItem, 'Quantity'), order),
                    DiscountEndDate: null,
                    TrialEndDate: null,
                },
                associations: [
                    {
                        recordId: product.id,
                        relatedAssociationId: product.dbRecordAssociation ? product.dbRecordAssociation.id : undefined,
                    },
                ],
            };

            const updatedItem = await this.dbService.updateDbRecordsByPrincipalAndId(
                principal,
                orderItem.id,
                OrderItemUpdate,
            );

            // If the order is in the success stage process all the order items for billing
            if(order.stage.isSuccess) {

                await this.processOrderItemsForBilling(principal, order.id, [ orderItem.id ]);

            }

            // Compute order total
            await this.ordersService.computeOrderTotals(principal, order.id);

            return updatedItem;

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }

    /**
     *  Add order items to an order
     * @param principal
     * @param orderId
     * @param headers
     * @param body
     */
    public async createOrderItemsFromProducts(
        principal: OrganizationUserEntity,
        orderId: string,
        body: DbRecordAssociationCreateUpdateDto[],
    ): Promise<IDbRecordCreateUpdateRes[]> {
        try {

            const { ORDER_ITEM } = SchemaModuleEntityTypeEnums;

            const order = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                orderId,
                [ ORDER_ITEM ],
            );

            const existingItems = order[ORDER_ITEM].dbRecords;
            const productIds = existingItems ? existingItems.map(elem => getProperty(elem, 'ProductRef')) : [];

            // TODO: Add all order product rule interpreters;

            // retrieve products
            const products = [];
            for(const item of body) {
                if(productIds.includes(item.recordId) === false) {
                    if(item.relatedAssociationId) {

                        const product = await this.dbRecordsAssociationsService.getRelatedRecordById(
                            principal.organization,
                            {
                                recordId: item.recordId,
                                dbRecordAssociationId: item.relatedAssociationId,
                            },
                        );

                        products.push(product);
                    } else {
                        const product = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                            principal.organization,
                            item.recordId,
                            [],
                        );
                        products.push(product);
                    }
                }
            }

            // Find all products that should be added to the order
            const orderItemsToCreate: DbRecordCreateUpdateDto[] = [];

            for(const newItem of body) {
                const product = products.find(elem => elem.id === newItem.recordId);

                if(product) {
                    orderItemsToCreate.push({
                        entity: `${SchemaModuleTypeEnums.ORDER_MODULE}:${SchemaModuleEntityTypeEnums.ORDER_ITEM}`,
                        title: getProperty(product, 'DisplayName') || product.title,
                        properties: CreateOrderItemFromProduct.construct(product, 1, order),
                        associations: [
                            {
                                recordId: order.id,
                            },
                            {
                                recordId: product.id,
                                relatedAssociationId: product.dbRecordAssociation ? product.dbRecordAssociation.id : undefined,
                            },
                        ],
                    });
                }
            }

            const orderItems = await this.dbService.updateOrCreateDbRecordsByPrincipal(
                principal,
                orderItemsToCreate,
                { upsert: true },
            );

            return orderItems;
        } catch (e) {
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }

    /**
     *
     * @param principal
     * @param dbRecordAssociationId
     * @param headers
     */
    public async computeOrderTotalFromOrderItem(
        principal: OrganizationUserEntity,
        orderItemId: string,
    ): Promise<boolean> {
        try {

            const orderSchema = await this.schemasService.getSchemaByOrganizationAndEntity(
                principal.organization,
                `${ORDER_MODULE}:${ORDER}`,
            );

            const parentRecordIds = await this.dbRecordsAssociationsService.getRelatedParentRecordIds(
                principal.organization,
                {
                    recordId: orderItemId,
                    parentSchemaId: orderSchema.id,
                    relatedAssociationId: undefined,
                },
                { withDeleted: true },
            );

            for(const parentId of parentRecordIds) {
                await this.ordersService.computeOrderTotals(principal, parentId);
            }

            return true;
        } catch (e) {
            console.log(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }


    /**
     *
     * @param principal
     * @param orderId
     * @param billingStartDate
     * @param orderItemIds
     */
    public async processOrderItemsForBilling(
        principal: OrganizationUserEntity,
        orderId: string,
        orderItemIds: string[],
    ): Promise<IDbRecordCreateUpdateRes[]> {
        try {

            const { PRODUCT, ORDER } = SchemaModuleEntityTypeEnums;
            let modified: IDbRecordCreateUpdateRes[] = [];

            const order = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                orderId,
                [],
            );

            if(order.stage.isSuccess) {

                const billingStartDate = getProperty(order, 'BillingStartDate');

                for(const id of orderItemIds) {

                    const orderItem = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                        principal.organization,
                        id,
                        [ PRODUCT, ORDER ],
                    );

                    const {
                        nextBillingDate,
                        nextInvoiceDate,
                        periodType,
                        trialEndDate,
                        discountEndDate,
                    } = await OrdersItemsService.computeBillingPeriodDates(
                        billingStartDate,
                        orderItem,
                    );

                    const TotalPrice = OrdersItemsService.computeAdjustedTotalPriceForBillingPeriodType(
                        periodType,
                        orderItem,
                    );

                    const update = new DbRecordCreateUpdateDto();
                    update.schemaId = orderItem.schemaId;
                    update.properties = {
                        ActivationStatus: 'CLOSED',
                        BillingStartDate: moment(billingStartDate).format('YYYY-MM-DD'),
                        NextBillingDate: moment(nextBillingDate).format('YYYY-MM-DD'),
                        NextInvoiceDate: moment(nextInvoiceDate).format('YYYY-MM-DD'),
                        DiscountEndDate: discountEndDate ? moment(discountEndDate).format('YYYY-MM-DD') : undefined,
                        TrialEndDate: trialEndDate ? moment(trialEndDate).format('YYYY-MM-DD') : undefined,
                        BillingPeriodType: periodType,
                        TotalPrice,
                    };

                    console.log({ nextBillingDate, nextInvoiceDate, periodType, trialEndDate, discountEndDate });

                    const updatedItem = await this.dbService.updateDbRecordsByPrincipalAndId(principal, id, update);
                    modified.push(updatedItem);
                }
            }

            return modified;
        } catch (e) {
            console.log(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }

    /**
     *
     * @param periodType
     * @param orderItem
     * @param ORDER
     * @private
     */
    private static computeAdjustedTotalPriceForBillingPeriodType(
        periodType: string,
        orderItem: DbRecordEntityTransform,
    ) {
        if(periodType === 'DISCOUNT') {
            // do not remove the discount period from the computed total price
            return Number(OrderItemCalculations.computeOrderItemPreTaxTotalPrice(
                {
                    id: orderItem.id,
                    schema: undefined,
                    properties: orderItem.properties,
                },
                orderItem[ORDER].dbRecords[0],
                false,
            ));
        } else if(periodType === 'STANDARD') {
            // remove the discount period from the computed total price
            return Number(OrderItemCalculations.computeOrderItemPreTaxTotalPrice(
                {
                    id: orderItem.id,
                    schema: undefined,
                    properties: orderItem.properties,
                },
                orderItem[ORDER].dbRecords[0],
                true,
            ));
        } else {
            return getProperty(orderItem, 'TotalPrice');
        }
    }

    /**
     *
     * @param billingStartDate
     * @param orderItem
     */
    private static async computeBillingPeriodDates(
        billingStartDate: string,
        orderItem: DbRecordEntityTransform,
    ) {

        const { PRODUCT } = SchemaModuleEntityTypeEnums;

        const chargeType = getPropertyFromRelation(orderItem, PRODUCT, 'ChargeType');
        const intervalUnit = getPropertyFromRelation(orderItem, PRODUCT, 'IntervalUnit');
        const intervalLength = getPropertyFromRelation(orderItem, PRODUCT, 'IntervalLength');
        const trialUnit = getPropertyFromRelation(orderItem, PRODUCT, 'TrialUnit');
        const trialLength = getPropertyFromRelation(orderItem, PRODUCT, 'TrialLength');
        const discountUnit = getPropertyFromRelation(orderItem, PRODUCT, 'DiscountUnit');
        const discountLength = getPropertyFromRelation(orderItem, PRODUCT, 'DiscountLength');


        // Check the billing start date difference from today and set the adjusted start date
        // if the billing start date is in the past the adjusted start date is the current
        const adjustedStartDate = this.getDateWithDiffFromToday(billingStartDate, intervalUnit);

        // if their is a trial period adjust the next billing date to be the trial end date
        const trialEndDate = this.trialPeriodAdjustments(
            billingStartDate,
            intervalLength,
            intervalUnit,
            trialLength,
            trialUnit,
        );

        // the discount startDate would be after any trial periods
        const discountStartDate = trialEndDate || billingStartDate;
        const discountEndDate = this.discountPeriodAdjustments(discountLength, discountStartDate, discountUnit);

        // the next invoice date is the next time the customer will receive an invoice
        const nextInvoiceDate = this.setNextInvoiceDate(
            billingStartDate,
            chargeType,
            intervalLength,
            intervalUnit,
        );

        const isInTrialPeriod = this.isCurrentPeriodWithinTrialPeriod(trialEndDate, nextInvoiceDate);
        console.log('isInTrialPeriod', isInTrialPeriod);

        let nextBillingDate = isInTrialPeriod ? trialEndDate : adjustedStartDate;

        // the next billing date is the next time the customer will be charged if there are charges.
        nextBillingDate = this.setNextBillingDate(
            nextBillingDate,
            billingStartDate,
            chargeType,
            intervalLength,
            intervalUnit,
        );

        // set the billing period type
        const periodType = this.getCurrentBillingPeriodType(nextInvoiceDate, trialEndDate, discountEndDate);

        console.log({
            billingStartDate,
            adjustedStartDate,
            trialEndDate,
            discountEndDate,
            nextInvoiceDate,
            nextBillingDate,
            periodType,
            intervalLength,
            intervalUnit,
        });

        return { nextInvoiceDate, nextBillingDate, periodType, trialEndDate, discountEndDate };
    }

    /**
     *
     * @param nextBillingDate
     * @param billingStartDate
     * @param chargeType
     * @param intervalLength
     * @param intervalUnit
     * @private
     */
    private static setNextBillingDate(
        nextBillingDate: string,
        billingStartDate: string,
        chargeType,
        intervalLength,
        intervalUnit,
    ) {

        const currentDay = moment().utc().format('YYYY-MM-DD');

        if(nextBillingDate && moment(nextBillingDate).isValid() && moment(nextBillingDate).isBefore(currentDay)) {
            // If the next billing date is the same as the billing start date and the billing start date is in the
            // keep the nextBillingDate as the billing start date
            if(chargeType === 'RECURRING') {
                // if the nextBillingDate is the same or before today we need to set the next billing date using the
                // interval unit ( days, months ) and the interval length ( 1,2 3 ...)
                nextBillingDate = moment(nextBillingDate).add(intervalLength, intervalUnit).format('YYYY-MM-DD');

            } else if(chargeType === 'ONE_TIME') {

                nextBillingDate = moment(billingStartDate).format('YYYY-MM-DD');

            } else if(chargeType === 'USAGE') {

                nextBillingDate = moment(nextBillingDate).add(intervalLength, intervalUnit).format('YYYY-MM-DD');

            }
        }


        return nextBillingDate;
    }

    /**
     *
     * @param nextBillingDate
     * @param billingStartDate
     * @param chargeType
     * @param intervalLength
     * @param intervalUnit
     * @private
     */
    private static setNextInvoiceDate(
        billingStartDate: string,
        chargeType,
        intervalLength,
        intervalUnit,
    ) {

        let nextInvoiceDate;

        const adjustedStartDate = this.getDateWithDiffFromToday(
            billingStartDate,
            intervalUnit,
        );

        const currentDay = moment().utc().format('YYYY-MM-DD');

        console.log('------SET_NEXT_INVOICE_DATE');
        console.log('billingStartDate', billingStartDate);
        console.log('adjustedStartDate', adjustedStartDate);
        console.log('currentDay', currentDay);
        console.log('beforeCurrentDay', moment(adjustedStartDate).isBefore(currentDay));

        if(adjustedStartDate && moment(adjustedStartDate).isValid() && moment(adjustedStartDate).isBefore(currentDay)) {

            // If the next billing date is the same as the billing start date and the billing start date is in the
            if(chargeType === 'RECURRING') {

                // if the nextBillingDate is the same or before today we need to set the next billing date using the
                // interval unit ( days, months ) and the interval length ( 1,2 3 ...)
                nextInvoiceDate = moment(adjustedStartDate)
                    .add(intervalLength, intervalUnit)
                    .format('YYYY-MM-DD');

            } else if(chargeType === 'ONE_TIME') {

                nextInvoiceDate = moment(adjustedStartDate)
                    .format('YYYY-MM-DD');

            } else if(chargeType === 'USAGE') {

                nextInvoiceDate = moment(adjustedStartDate)
                    .add(intervalLength, intervalUnit)
                    .format('YYYY-MM-DD');

            }

        } else if(billingStartDate && moment(billingStartDate).isBefore(adjustedStartDate)) {

            nextInvoiceDate = adjustedStartDate;

        } else {
            // this is to match if the billing start date is set to a future date
            nextInvoiceDate = billingStartDate;
        }

        return nextInvoiceDate;
    }


    /**
     *
     * @param trialLength
     * @param billingStartDate
     * @param intervalLength
     * @param intervalUnit
     * @param trialUnit
     * @param nextBillingDate
     * @private
     */
    private static trialPeriodAdjustments(
        billingStartDate: string,
        intervalLength: string,
        intervalUnit: string,
        trialLength: string,
        trialUnit,
    ) {
        let trialEndDate;

        if(Number(trialLength) && Number(trialLength) > 0) {
            // construct the trial end date
            trialEndDate = moment(billingStartDate)
                .add(Number(trialLength), trialUnit.toLowerCase())
                .format('YYYY-MM-DD');

        }

        return trialEndDate;

    }


    /**
     *
     * @param discountLength
     * @param nextBillingDate
     * @param discountUnit
     * @private
     */
    private static discountPeriodAdjustments(discountLength, discountStartDate: string, discountUnit) {

        let discountEndDate;

        if(Number(discountLength) && Number(discountLength) > 0) {
            // check the discount end date
            discountEndDate = moment(discountStartDate)
                .add(discountLength, discountUnit)
                .format('YYYY-MM-DD');
        }

        return discountEndDate;
    }

    /**
     *
     * @param currentNextBillingDate
     * @param nextBillingDate
     * @param billingStartDate
     * @param intervalUnit
     * @private
     */
    private static getDateWithDiffFromToday(
        billingStartDate: string,
        intervalUnit,
    ) {

        let date;

        const currentDay = moment().utc().format('YYYY-MM-DD');

        // get the billing start date difference from the current day and the billing start date
        // in the billing intervalUnit MONTHS || DAYS
        const billingStartDiff = moment(currentDay).diff(billingStartDate, intervalUnit);

        // if there is a difference adjust the billingStartDate with the difference
        if(billingStartDiff > 0) {

            // add the difference to the billing start date
            // this gives us the current date to set future dates from
            date = moment(billingStartDate)
                .add(billingStartDiff, intervalUnit)
                .format('YYYY-MM-DD');

        } else {

            // billing start date is in the future, do nothing.
            date = billingStartDate;
        }

        return date;
    }

    /**
     *
     * @param trialEndDate
     * @param nextBillingDate
     * @param discountEndDate
     * @private
     */
    private static getCurrentBillingPeriodType(nextInvoiceDate: string, trialEndDate, discountEndDate) {

        if(this.isCurrentPeriodWithinTrialPeriod(trialEndDate, nextInvoiceDate)) {

            return 'FREE';

        } else if(this.isCurrentPeriodWithinDiscountPeriod(discountEndDate, nextInvoiceDate)) {

            return 'DISCOUNT'

        } else {

            return 'STANDARD';

        }
    }

    /**
     * Check if the current billing period is in the trial period
     * Can be used to flag if this item is in a trial period
     * @param trialPeriodEndDate
     * @param nextBillingDate
     * @private
     */
    private static isCurrentPeriodWithinTrialPeriod(trialPeriodEndDate: string, nextInvoiceDate: string) {

        if(trialPeriodEndDate && moment(trialPeriodEndDate).isValid()) {

            console.log('------------IS_WITHIN_TRIAL_PERIOD')
            console.log('nextInvoiceDate', nextInvoiceDate);
            console.log('trialPeriodEndDate', trialPeriodEndDate);
            console.log('isNextBillingBeforeTrialEnd', moment(nextInvoiceDate).isBefore(trialPeriodEndDate));

            // for in advance billing isBefore
            return moment(nextInvoiceDate).isBefore(trialPeriodEndDate);

            // TODO: we need to have organization level billing settings to specify the billing
            //  for in arrears billing isSameOrBefore

        } else {

            return false;

        }

    }

    /**
     * Check if the current billing period is in the discount period
     * Can be used to flag if this item is in a discount period
     * @param discountEndDate
     * @param nextBillingDate
     * @private
     */
    private static isCurrentPeriodWithinDiscountPeriod(discountEndDate: string, nextBillingDate: string) {

        if(discountEndDate && moment(discountEndDate).isValid()) {

            console.log('------------IS_WITHIN_DISCOUNT_PERIOD')
            console.log('nextBillingDate', nextBillingDate);
            console.log('discountEndDate', discountEndDate);
            console.log('isNextBillingBeforeDiscountEnd', moment(nextBillingDate).isBefore(discountEndDate));

            // for in advance billing isBefore
            return moment(nextBillingDate).isBefore(discountEndDate);

            // TODO: we need to have organization level billing settings to specify the billing
            //  for in arrears billing isSameOrBefore

        } else {

            return false;

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
        orderItemId: string,
    ): Promise<IDbRecordCreateUpdateRes> {
        try {
            return await this.dbService.updateDbRecordsByPrincipalAndId(principal, orderItemId, {
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
        } catch (e) {
            throw new ExceptionType(e.statusCode, e.message);
        }
    }
}
