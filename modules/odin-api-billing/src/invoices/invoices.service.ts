import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { SendgridEmailEntity } from '@d19n/models/dist/notifications/sendgrid/email/sendgrid.email.entity';
import { SUB_SEND_DYNAMIC_EMAIL } from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
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
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as moment from 'moment';
import { InvoiceCalculations } from '../helpers/InvoiceCalculations';


const { BILLING_MODULE, NOTIFICATION_MODULE } = SchemaModuleTypeEnums;
const { INVOICE, INVOICE_ITEM, CONTACT, ADDRESS, DISCOUNT, TRANSACTION, ACCOUNT } = SchemaModuleEntityTypeEnums;

dotenv.config();

@Injectable()
export class InvoicesService {

    protected schemasService: SchemasService;
    protected dbService: DbService;
    protected dbRecordsService: DbRecordsService;
    protected dbRecordsAssociationsService: DbRecordsAssociationsService;
    protected amqpConnection: AmqpConnection;

    constructor(
        schemasService: SchemasService,
        dbRecordsService: DbRecordsService,
        dbRecordsAssociationsService: DbRecordsAssociationsService,
        dbService: DbService,
        amqpConnection: AmqpConnection,
    ) {
        this.schemasService = schemasService;
        this.dbService = dbService;
        this.dbRecordsService = dbRecordsService;
        this.dbRecordsAssociationsService = dbRecordsAssociationsService;
        this.amqpConnection = amqpConnection;
    }

    /**
     *
     * @param principal
     * @param orderId
     * @param items
     * @param headers
     */
    public async createInvoiceFromOrder(
        principal: OrganizationUserEntity,
        orderId: string,
        items?: DbRecordAssociationCreateUpdateDto[],
    ) {
        try {

            const order = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                orderId,
                [ CONTACT, ADDRESS, DISCOUNT, 'BillingAdjustment', ACCOUNT ],
            );

            const parallelProcess = [];
            let orderItems: DbRecordEntityTransform[] = [];

            if(!!items && Object.keys(items).length > 0) {
                for(let item of items) {
                    parallelProcess.push({
                        func: this.dbService.getDbRecordTransformedByOrganizationAndId(
                            principal.organization,
                            item.recordId,
                            [],
                        ),
                    });
                }
                orderItems = await Promise.all(parallelProcess.map(elem => elem.func)).then(res => res);
            } else {
                throw new ExceptionType(400, 'no order items selected for invoicing');
            }

            await this.validateOrderForInvoicing(order);

            const orderContact = order[CONTACT].dbRecords;
            const orderAddress = order[ADDRESS].dbRecords;
            const orderDiscount = order[DISCOUNT].dbRecords;
            const orderAccount = order[ACCOUNT].dbRecords;

            const issuedDate = moment().utc().format('YYYY-MM-DD');

            // find an order item with a nextInvoiceDate if exists
            const nextInvoiceDate = this.getNextInvoiceDateFromOrderItems(orderItems);
            const billingStartDate = getProperty(order, 'BillingStartDate');

            // Get the billing adjustment
            const billingAdjustment = await this.getOrderBillingAdjustments(principal, order);

            const invoiceCreate = new DbRecordCreateUpdateDto();
            invoiceCreate.entity = `${SchemaModuleTypeEnums.BILLING_MODULE}:${SchemaModuleEntityTypeEnums.INVOICE}`;
            invoiceCreate.title = order.title;
            invoiceCreate.properties = {
                Status: 'SCHEDULED',
                BillingTerms: getProperty(order, 'BillingTerms'),
                CurrencyCode: getProperty(order, 'CurrencyCode'),
                BillingStartDate: billingStartDate,
                IssuedDate: issuedDate,
                DueDate: InvoicesService.computeDueDate(
                    { billingStartDate, issuedDate, nextInvoiceDate },
                    getProperty(order, 'BillingTerms'),
                ),
                DiscountValue: getProperty(order, 'DiscountValue') || 0,
                DiscountType: getProperty(order, 'DiscountType') || 'AMOUNT',
                OrderRef: order.id,
                Subtotal: 0,
                TotalDiscounts: 0,
                TotalTaxAmount: 0,
                TotalDue: 0,
                Balance: 0,
            };
            invoiceCreate.associations = [
                { recordId: order.id },
                { recordId: orderAccount[0].id },
                { recordId: orderContact[0].id },
                { recordId: orderAddress[0].id },
                { recordId: orderDiscount ? orderDiscount[0].id : undefined },
                { recordId: billingAdjustment ? billingAdjustment['id'] : undefined },
            ];

            const invoice = await this.dbService.updateOrCreateDbRecordsByPrincipal(
                principal,
                [ invoiceCreate ],
                { upsert: true },
            );

            await this.createInvoiceItemsFromOrderItems(principal, invoice[0].id, orderItems, billingAdjustment);
            await this.computeInvoiceTotals(principal, invoice[0].id);

            return { id: invoice[0].id };

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }


    /**
     *
     * @param orderItems
     * @private
     */
    private getNextInvoiceDateFromOrderItems(orderItems: DbRecordEntityTransform[]) {
        const orderItem = orderItems.find(elem => getProperty(elem, 'NextInvoiceDate'));
        const nextInvoiceDate = getProperty(orderItem, 'NextInvoiceDate');
        return nextInvoiceDate;
    }

    /**
     *
     * @param dbRecords
     * @private
     */
    private sortDbRecordsByCreatedAtNewestFirst(dbRecords: DbRecordEntityTransform[]) {
        if(dbRecords) {
            const sorted = dbRecords.sort((
                elemA: DbRecordEntityTransform,
                elemB: DbRecordEntityTransform,
            ) => {
                // @ts-ignore
                return elemA && elemB && new Date(elemB.createdAt || '') - new Date(elemA.createdAt || '')
            });
            return sorted;
        }
        return [];
    }


    /**
     *
     * @param order
     * @private
     */
    private async getOrderBillingAdjustments(
        principal: OrganizationUserEntity,
        order: DbRecordEntityTransform,
    ): Promise<{ id: string, BillingPeriodType: string }> {
        const billingAdjustments = order['BillingAdjustment'].dbRecords;
        if(billingAdjustments) {
            // get the last created adjustment

            const lastAdjustment = this.sortDbRecordsByCreatedAtNewestFirst(billingAdjustments)[0];
            const adjustment = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                lastAdjustment.id,
                [ 'Invoice' ],
            );

            const freePeriodLength = getProperty(adjustment, 'FreePeriodLength');
            const adjustmentInvoices = adjustment['Invoice'].dbRecords;
            // check if the billing adjustments have applied to the invoices
            if(adjustmentInvoices) {
                const invoicesNotVoided = adjustmentInvoices.filter(elem => getProperty(elem, 'Status') !== 'VOID');
                // check if the interval < the number of times the adjustment has been applied to an invoice
                if(freePeriodLength && invoicesNotVoided.length < Number(freePeriodLength)) {
                    // the adjustment should be applied
                    return {
                        id: adjustment.id,
                        BillingPeriodType: 'FREE',
                    }
                }
            } else if(freePeriodLength) {
                // adjustment has no invoices add it to this invoice
                return {
                    id: adjustment.id,
                    BillingPeriodType: 'FREE',
                }
            }
        }
    }


    /**
     *
     * @param principal
     * @param invoiceId
     * @param orderItems
     */
    public async createInvoiceItemsFromOrderItems(
        principal: OrganizationUserEntity,
        invoiceId: string,
        orderItems: DbRecordEntityTransform[],
        billingAdjustment?: { id: string, BillingPeriodType: string },
    ) {
        const itemsToCreate: DbRecordCreateUpdateDto[] = [];
        for(let item of orderItems) {

            // apply billing adjustments
            if(billingAdjustment) {
                item = Object.assign(
                    {},
                    item,
                    {
                        properties: Object.assign(
                            {},
                            item.properties,
                            { BillingPeriodType: billingAdjustment['BillingPeriodType'] },
                        ),
                    },
                );
            }

            itemsToCreate.push({
                entity: `${BILLING_MODULE}:${INVOICE_ITEM}`,
                title: item.title,
                properties: {
                    Description: getProperty(item, 'Description'),
                    UnitPrice: getProperty(item, 'UnitPrice'),
                    DiscountValue: this.setDiscountValue(item),
                    DiscountType: this.setDiscountType(item),
                    Quantity: getProperty(item, 'Quantity'),
                    TaxRate: getProperty(item, 'TaxRate'),
                    Taxable: getProperty(item, 'Taxable'),
                    TaxIncluded: getProperty(item, 'TaxIncluded'),
                    TotalPrice: getProperty(item, 'TotalPrice'),
                    ProductRef: getProperty(item, 'ProductRef'),
                    BillingPeriodType: getProperty(item, 'BillingPeriodType'),
                },
                associations: [
                    { recordId: invoiceId },
                ],
            });
        }
        return await this.dbService.updateOrCreateDbRecordsByPrincipal(principal, itemsToCreate, { upsert: true });
    }


    /**
     *
     * @param principal
     * @param invoiceId
     * @param headers
     */
    public async computeInvoiceTotals(
        principal: OrganizationUserEntity,
        invoiceId: string,
    ): Promise<IDbRecordCreateUpdateRes> {
        try {

            const invoice = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                invoiceId,
                [ INVOICE_ITEM ],
            );
            const invoiceItems = invoice[INVOICE_ITEM].dbRecords;
            let update;

            if(!invoiceItems) {
                update = {
                    schemaId: invoice.schemaId,
                    properties: {
                        Subtotal: 0,
                        TotalDiscounts: 0,
                        TotalTaxAmount: 0,
                        TotalDue: 0,
                        Balance: 0,
                    },
                };
            } else {
                update = {
                    schemaId: invoice.schemaId,
                    properties: {
                        Subtotal: InvoiceCalculations.computeSubtotal(invoiceItems),
                        TotalDiscounts: InvoiceCalculations.computeTotalDiscounts(invoiceItems, invoice),
                        TotalTaxAmount: InvoiceCalculations.computeTotalTax(invoiceItems, invoice),
                        TotalDue: InvoiceCalculations.computeTotalDue(invoiceItems, invoice),
                        Balance: InvoiceCalculations.computeTotalDue(invoiceItems, invoice),
                    },
                }
            }

            return await this.dbService.updateDbRecordsByPrincipalAndId(principal, invoiceId, update);

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }

    /**
     *  templateLabels:
     * SENDGRID_INVOICE_NEW
     *
     * @param principal
     * @param invoiceId
     * @param templateLabel
     * @param headers
     * @param body
     */
    public async sendEmail(
        principal: OrganizationUserEntity,
        invoiceId: string,
        templateLabel: string,
        body?: SendgridEmailEntity,
    ): Promise<any> {
        try {

            // If the invoice is NOT voided compute the invoice total
            const isVoided = await this.isVoided(principal, invoiceId);
            if(!isVoided) {

                await this.computeInvoiceTotals(principal, invoiceId);

            }

            const invoice = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                invoiceId,
                [
                    CONTACT, INVOICE_ITEM,
                ],
            );

            await this.validatedEmail(invoice);

            const invoiceContactFirstName = getPropertyFromRelation(invoice, CONTACT, 'FirstName');
            const invoiceContactLastName = getPropertyFromRelation(invoice, CONTACT, 'LastName');
            const invoiceContactEmailAddress = getPropertyFromRelation(invoice, CONTACT, 'EmailAddress');

            const newEmail = new SendgridEmailEntity();
            newEmail.to = invoiceContactEmailAddress;
            newEmail.from = principal.organization.billingReplyToEmail;
            newEmail.templateLabel = templateLabel;
            newEmail.dynamicTemplateData = Object.assign({}, {
                recordNumber: invoice.recordNumber,
                recordId: invoiceId,
                contactFirstName: invoiceContactFirstName,
                contactLastName: invoiceContactLastName,
                invoice: Object.assign({}, invoice.properties, {
                    IssuedDate: moment(getProperty(invoice, 'IssuedDate')).format('DD-MM-YYYY'),
                    DueDate: moment(getProperty(invoice, 'DueDate')).format('DD-MM-YYYY'),
                }),
                invoiceItems: invoice[INVOICE_ITEM].dbRecords.map(elem => ({
                    lineItemName: elem.title,
                    lineItemDescription: getProperty(elem, 'Description'),
                    lineItemTotal: getProperty(elem, 'UnitPrice'),
                    lineItemBillingPeriod: getProperty(elem, 'BillingPeriodType'),
                    isFreePeriod: getProperty(elem, 'BillingPeriodType') === 'FREE',
                    isDiscountPeriod: getProperty(elem, 'BillingPeriodType') === 'DISCOUNT',
                    isStandardPeriod: getProperty(elem, 'BillingPeriodType') === 'STANDARD',
                })),
                isVoided: getProperty(invoice, 'Status') === 'VOID',
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
     * @param invoice
     * @private
     */
    private async isVoided(principal: OrganizationUserEntity, invoiceId: string): Promise<boolean> {

        const invoice = await this.dbService.getDbRecordTransformedByOrganizationAndId(
            principal.organization,
            invoiceId,
            [],
        );

        return getProperty(invoice, 'Status') === 'VOID'
    }


    /**
     *
     * @param principal
     * @param invoiceId
     * @param headers
     */
    public async removeDiscountByPrincipal(
        principal: OrganizationUserEntity,
        invoiceId: string,
    ): Promise<IDbRecordCreateUpdateRes> {
        try {
            const invoiceSchema = await this.schemasService.getSchemaByOrganizationAndEntity(
                principal.organization,
                `${SERVICE_NAME.BILLING_MODULE}:${SchemaModuleEntityTypeEnums.INVOICE}`,
            );
            await this.dbService.updateDbRecordsByPrincipalAndId(principal, invoiceId, {
                schemaId: invoiceSchema.id,
                properties: {
                    DiscountValue: 0,
                    DiscountType: 'AMOUNT',
                },
            });
            return await this.computeInvoiceTotals(principal, invoiceId);
        } catch (e) {
            throw new ExceptionType(e.statusCode, e.message);
        }
    }


    /**
     *
     * @param principal
     * @param invoiceId
     * @param discountId
     * @param headers
     */
    public async addDiscountByPrincipal(
        principal: OrganizationUserEntity,
        invoiceId: string,
        relatedDiscountId: string,
    ): Promise<IDbRecordCreateUpdateRes> {
        try {

            const discount = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                relatedDiscountId,
                [],
            );

            const update: DbRecordCreateUpdateDto = {
                entity: `${BILLING_MODULE}:${INVOICE}`,
                properties: {
                    DiscountValue: discount.properties['DiscountValue'],
                    DiscountType: discount.properties['DiscountType'],
                },
            };

            await this.dbService.updateDbRecordsByPrincipalAndId(principal, invoiceId, update);
            return await this.computeInvoiceTotals(principal, invoiceId);

        } catch (e) {
            throw new ExceptionType(e.statusCode, e.message);
        }
    }

    /**
     *
     * @param principal
     * @param invoiceId
     * @param body
     */
    public async voidInvoiceById(
        principal: OrganizationUserEntity,
        invoiceId: string,
        body: SendgridEmailEntity,
    ): Promise<IDbRecordCreateUpdateRes> {
        try {

            const invoice = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                invoiceId,
                [
                    TRANSACTION,
                ],
            );

            this.validateIfInvoiceIsVoidable(invoice);

            const updatedInvoice = await this.dbService.updateDbRecordsByPrincipalAndId(principal, invoiceId, {
                entity: `${BILLING_MODULE}:${INVOICE}`,
                properties: {
                    Status: 'VOID',
                    Subtotal: 0,
                    TotalDiscounts: 0,
                    TotalTaxAmount: 0,
                    TotalDue: 0,
                    Balance: 0,
                },
            });

            // Send invoice voided email
            this.sendEmail(principal, invoice.id, 'SENDGRID_INVOICE_VOIDED');
            return updatedInvoice;
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }

    /**
     *
     * @param invoice
     */
    private validatedEmail(invoice: DbRecordEntityTransform) {
        const { CONTACT, INVOICE_ITEM } = SchemaModuleEntityTypeEnums;

        const invoiceContact = invoice[CONTACT].dbRecords;
        const invoiceItems = invoice[INVOICE_ITEM].dbRecords;
        const invoiceSubtotal = getProperty(invoice, 'Subtotal');

        // Contact
        if(!invoiceContact) {
            throw new ExceptionType(400, 'no contact on the invoice, cannot send confirmation');
        }
        // Items
        if(!invoiceItems) {
            throw new ExceptionType(400, 'no invoice items on the invoice, cannot send confirmation');
        }
    }


    /**
     *
     * @param order
     */
    private validateOrderForInvoicing(order: DbRecordEntityTransform) {

        const { CONTACT, ADDRESS } = SchemaModuleEntityTypeEnums;

        const orderContact = order[CONTACT].dbRecords;
        const orderAddress = order[ADDRESS].dbRecords;
        const orderAccount = order[ACCOUNT].dbRecords;

        if(!orderAccount) {
            throw new ExceptionType(400, 'no account, cannot create an invoice');
        }
        if(!orderContact) {
            throw new ExceptionType(400, 'no contact, cannot create an invoice');
        }
        if(!orderAddress) {
            throw new ExceptionType(400, 'no address, cannot create invoice');
        }
    }

    /**
     *
     * @param params
     * @param billingTerms
     */
    private static computeDueDate(
        params: { issuedDate: string, nextInvoiceDate: string, billingStartDate: string },
        billingTerms: any,
    ) {
        const { nextInvoiceDate } = params;

        const split = billingTerms.split('_');
        const billingTermsDays = split[1];

        return moment(nextInvoiceDate).add(billingTermsDays, 'days').format('YYYY-MM-DD');
    }


    /**
     *
     * @param invoice
     * @private
     */
    private validateIfInvoiceIsVoidable(invoice: DbRecordEntityTransform) {

        const transactions = invoice[TRANSACTION].dbRecords;

        if(transactions) {

            const count = transactions.length;
            const cancelled = transactions.filter(elem => [ 'cancelled', 'CANCELLED' ].includes(getProperty(
                elem,
                'Status',
            )));

            // if all transactions are not cancelled then throw an error.
            if(count !== cancelled.length) {

                throw new ExceptionType(400, 'the invoice has transactions and cannot be voided');

            }
        }
    }

    /**
     *
     * @param item
     * @private
     */
    private setDiscountValue(item: DbRecordEntityTransform) {
        const billingPeriodType = getProperty(item, 'BillingPeriodType');
        if(billingPeriodType === 'FREE') {
            return 100;
        } else {
            // returns the default DiscountValue
            return getProperty(item, 'DiscountValue');
        }

    }

    /**
     *
     * @param item
     * @private
     */
    private setDiscountType(item: DbRecordEntityTransform) {
        const billingPeriodType = getProperty(item, 'BillingPeriodType');
        if(billingPeriodType === 'FREE') {
            return 'PERCENT';
        } else {
            // returns the default DiscountType
            return getProperty(item, 'DiscountType');
        }
    }
}
