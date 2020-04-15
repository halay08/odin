import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { SendgridEmailEntity } from '@d19n/models/dist/notifications/sendgrid/email/sendgrid.email.entity';
import { SUB_SEND_DYNAMIC_EMAIL } from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
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
import { GocardlessPaymentsService } from '../gocardless/payments/gocardless.payments.service';
import { GocardlessPaymentEntity } from '../gocardless/payments/types/gocardless.payment.entity';
import { GocardlessRefundsService } from '../gocardless/refunds/gocardless.refunds.service';
import { GocardlessRefundEntity } from '../gocardless/refunds/types/gocardless.refund.entity';
import { TransactionPaymentCreateDto } from './types/transaction.payment.create.dto';
import { TransactionRefundCreateDto } from './types/transaction.refund.create.dto';


const { NOTIFICATION_MODULE, BILLING_MODULE } = SchemaModuleTypeEnums;

dotenv.config();

@Injectable()
export class TransactionsService {

    private schemasService: SchemasService;
    private dbService: DbService;
    private dbRecordsService: DbRecordsService;
    private dbRecordsAssociationsService: DbRecordsAssociationsService;
    private gocardlessPaymentsService: GocardlessPaymentsService;
    private gocardlessRefundsService: GocardlessRefundsService;
    private amqpConnection: AmqpConnection;

    constructor(
        schemasService: SchemasService,
        dbRecordsService: DbRecordsService,
        gocardlessPaymentsService: GocardlessPaymentsService,
        gocardlessRefundsService: GocardlessRefundsService,
        dbRecordsAssociationsService: DbRecordsAssociationsService,
        dbService: DbService,
        amqpConnection: AmqpConnection,
    ) {
        this.schemasService = schemasService;
        this.dbService = dbService;
        this.dbRecordsService = dbRecordsService;
        this.dbRecordsAssociationsService = dbRecordsAssociationsService;
        this.gocardlessPaymentsService = gocardlessPaymentsService;
        this.gocardlessRefundsService = gocardlessRefundsService;
        this.amqpConnection = amqpConnection;
    }


    /**
     *
     * @param principal
     * @param invoiceId
     * @param body
     * @param headers
     */
    public async createPaymentTransactionForInvoice(
        principal: OrganizationUserEntity,
        invoiceId: string,
        body: TransactionPaymentCreateDto,
    ): Promise<IDbRecordCreateUpdateRes> {
        let invoice;
        let contact;
        let paymentMethod;
        try {
            const { CONTACT, PAYMENT_METHOD, INVOICE_ITEM } = SchemaModuleEntityTypeEnums;

            invoice = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                invoiceId,
                [ CONTACT, INVOICE_ITEM ],
            );

            await this.validateInvoiceForTransaction(invoice);

            contact = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                invoice[CONTACT].dbRecords[0].id,
                [ PAYMENT_METHOD ],
            );

            await this.validateContactForTransaction(contact);

            paymentMethod = this.selectDefaultPaymentMethod(contact);

            if(body.paymentMethodId) {

                paymentMethod = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                    principal.organization,
                    invoiceId,
                    [],
                );

            }

            if(!paymentMethod) {
                throw new ExceptionType(
                    400,
                    'payment does not have a status of (pending_customer_approval, pending_submission, submitted, active)',
                );
            }

            const gocardlessPayment = new GocardlessPaymentEntity();
            const amount = gocardlessPayment.convertToCents(getProperty(invoice, 'Balance'));
            gocardlessPayment.amount = amount;
            gocardlessPayment.currency = getProperty(invoice, 'CurrencyCode');
            gocardlessPayment.metadata = {
                invoiceId: invoice.id,
                recordNumber: invoice.recordNumber,
            };
            gocardlessPayment.links = {
                mandate: getProperty(paymentMethod, 'ExternalRef'),
            };

            // if the invoice balance is greater than 0
            // process a new payment transaction
            if(amount > 0) {

                const payment = await this.gocardlessPaymentsService.createPayment(
                    principal,
                    gocardlessPayment,
                );

                // If payment successful
                const create = await this.createPaymentSuccessTransaction(
                    principal,
                    invoice,
                    payment,
                    contact,
                    paymentMethod,
                );

                // update invoice with payment
                const newBalance = this.computeNewInvoiceBalanceFromPayment(
                    getProperty(invoice, 'Balance'),
                    payment.amount,
                );

                const update = new DbRecordCreateUpdateDto();
                update.schemaId = invoice.schemaId;
                update.properties = {
                    Status: 'PAYMENT_PENDING',
                };
                const updated = await this.dbService.updateDbRecordsByPrincipalAndId(principal, invoice.id, update);
                await this.sendEmail(principal, invoice.id, create[0].id, 'SENDGRID_TRANSACTION_CONFIRMATION');

                return updated;

            } else {
                // TODO: we need to validate that this should be marked PAID
                // TODO: i.e: there are successful transactions or all items are FREE
                const update = new DbRecordCreateUpdateDto();
                update.schemaId = invoice.schemaId;
                update.properties = {
                    Status: 'PAID',
                    Balance: 0,
                };
                return await this.dbService.updateDbRecordsByPrincipalAndId(principal, invoice.id, update);
            }
        } catch (e) {
            console.error(e);
            this.createFailedToProcessTransaction(
                principal,
                invoice,
                contact,
                paymentMethod,
                e.message,
                'PAYMENT',
            );
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }


    /**
     *
     * @param principal
     * @param transactionId
     * @param body
     * @param headers
     */
    public async createRefundForTransaction(
        principal: OrganizationUserEntity,
        transactionId: string,
        body: TransactionRefundCreateDto,
    ) {
        let invoice;
        let transaction;
        let contact;

        const { CONTACT, INVOICE } = SchemaModuleEntityTypeEnums;

        try {
            transaction = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                transactionId,
                [ INVOICE ],
            );

            invoice = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                transaction[INVOICE].dbRecords[0].id,
                [ CONTACT ],
            );

            contact = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                invoice[CONTACT].dbRecords[0].id,
                [ 'PaymentMethod' ],
            );

            await this.validateContactForTransaction(contact);

            const gocardlessRefund = new GocardlessRefundEntity();
            const refundAmount = gocardlessRefund.convertToCents(body.amount);
            const invoiceTotal = gocardlessRefund.convertToCents(getProperty(invoice, 'TotalDue'));

            gocardlessRefund.amount = refundAmount;
            gocardlessRefund.totalAmountConfirmation = invoiceTotal;
            gocardlessRefund.links = {
                payment: getProperty(transaction, 'ExternalRef'),
            };

            if(refundAmount > 0) {
                // create a default refund if being manually created
                let refund = new GocardlessRefundEntity();
                refund.id = body.refundId;
                refund.amount = refundAmount;
                refund.totalAmountConfirmation = invoiceTotal;
                refund.links = gocardlessRefund.links;
                // if there is no refundId provided then use the gocardless API to create a new refund

                if(!body.refundId) {
                    refund = await this.gocardlessRefundsService.createRefund(
                        principal,
                        gocardlessRefund,
                    );
                }
                // If refund successful
                const create = await this.createRefundSuccessTransaction(
                    principal,
                    invoice,
                    refund,
                    contact,
                );
                await this.sendEmail(principal, invoice.id, create[0].id, 'SENDGRID_TRANSACTION_CONFIRMATION');
                return create;
            }
            throw new ExceptionType(500, 'refund amount is 0, cannot process transaction');
        } catch (e) {
            console.error(e);
            this.createFailedToProcessTransaction(
                principal,
                invoice,
                contact,
                undefined,
                e.message,
                'REFUND',
            );
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }


    /**
     * templateLabels:
     * SENDGRID_INVOICE_CONFIRMATION
     *
     * @param principal
     * @param invoiceId
     * @param transactionId
     * @param templateLabel
     * @param headers
     * @param body
     */
    public async sendEmail(
        principal: OrganizationUserEntity,
        invoiceId: string,
        transactionId: string,
        templateLabel: string,
        body?: SendgridEmailEntity,
    ): Promise<any> {
        try {

            const { CONTACT, INVOICE_ITEM } = SchemaModuleEntityTypeEnums;

            const transaction = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                transactionId,
                [],
            );
            const invoice = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                invoiceId,
                [ CONTACT, INVOICE_ITEM ],
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
                recordNumber: transaction.recordNumber,
                invoiceNumber: invoice.recordNumber,
                recordId: transactionId,
                subject: 'New Transaction',
                type: transaction.properties.Type === 'REFUND' ? 'Refund' : 'Payment',
                contactFirstName: invoiceContactFirstName,
                contactLastName: invoiceContactLastName,
                transaction: transaction.properties,
                invoice: Object.assign({}, invoice.properties, {
                    IssuedDate: moment(getProperty(invoice, 'IssuedDate')).format('DD-MM-YYYY'),
                    DueDate: moment(getProperty(invoice, 'DueDate')).format('DD-MM-YYYY'),
                }),
                invoiceItems: invoice[INVOICE_ITEM].dbRecords.map(elem => ({
                    lineItemName: elem.title,
                    lineItemDescription: getProperty(elem, 'Description'),
                    lineItemTotal: getProperty(elem, 'UnitPrice'),
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

            return;
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }

    /**
     *
     * @param invoice
     */
    private validatedEmail(invoice: DbRecordEntityTransform) {

        const { CONTACT, INVOICE_ITEM } = SchemaModuleEntityTypeEnums;

        const invoiceItems = invoice[INVOICE_ITEM].dbRecords;
        const invoiceContact = invoice[CONTACT].dbRecords;
        // Contact
        if(!invoiceContact) {
            throw new ExceptionType(400, 'no contact on the invoice, cannot send confirmation');
        }

        if(!invoiceItems) {
            throw new ExceptionType(400, 'no invoice items, cannot create an invoice');
        }
    }


    /**
     *
     * @param invoice
     * @param contact
     */
    private validateInvoiceForTransaction(invoice: DbRecordEntityTransform) {

        const { INVOICE_ITEM } = SchemaModuleEntityTypeEnums;

        const invoiceItems = invoice[INVOICE_ITEM].dbRecords;

        if(!invoiceItems) {
            throw new ExceptionType(400, 'no invoice items, cannot create an invoice');
        }
        if(getProperty(invoice, 'Balance') && Number(getProperty(invoice, 'Balance')) < 1) {
            console.error('invoice balance is less than 1.00');
            // throw new ExceptionType(400, 'invoice balance is less than 1.00');
        }
    }

    /**
     *
     * @param invoice
     * @param contact
     */
    private validateContactForTransaction(contact: DbRecordEntityTransform) {

        const { PAYMENT_METHOD } = SchemaModuleEntityTypeEnums;

        const paymentMethods = contact[PAYMENT_METHOD].dbRecords;

        if(!paymentMethods) {
            throw new ExceptionType(400, 'no payment methods for contact, cannot create an transaction');
        }
    }

    /**
     *
     * @param contact
     */
    private selectDefaultPaymentMethod(contact: DbRecordEntityTransform) {

        const { PAYMENT_METHOD } = SchemaModuleEntityTypeEnums;


        const activeStatues = [ 'active', 'submitted', 'reinstated', 'created', 'pending_submission' ];
        const newStatuses = [ 'ACTIVE', 'SUBMITTED', 'PENDING_SUBMISSION', 'PENDING_CUSTOMER_APPROVAL' ];

        for(const method of contact[PAYMENT_METHOD].dbRecords) {
            if(
                getProperty(method, 'Provider') === 'GOCARDLESS'
                && getProperty(method, 'Type') === 'MANDATE'
                && [ ...activeStatues, ...newStatuses ].includes(getProperty(
                method,
                'Status',
                ))
                && getProperty(method, 'Default') === 'YES'
            ) {
                return method;
            }
        }
    }

    /**
     *
     * @param balance
     * @param amount
     */
    private computeNewInvoiceBalanceFromPayment(balance: string, amount: number): string {

        if(!isNaN(Number(balance))) {

            const newBalance = Number(balance) - (Number(amount) / 100);

            return Number(Number(newBalance).toPrecision(10)).toFixed(2);

        }
    }

    /**
     *
     * @param principal
     * @param invoice
     * @param contact
     * @param paymentMethod
     * @param error
     * @param type
     */
    private async createFailedToProcessTransaction(
        principal: OrganizationUserEntity,
        invoice: DbRecordEntityTransform,
        contact: DbRecordEntityTransform,
        paymentMethod: DbRecordEntityTransform,
        error: any,
        type: 'PAYMENT' | 'REFUND',
    ) {
        try {

            const { INVOICE, TRANSACTION } = SchemaModuleEntityTypeEnums;

            const transactionCreate = new DbRecordCreateUpdateDto();
            transactionCreate.entity = `${BILLING_MODULE}:${TRANSACTION}`;
            transactionCreate.title = invoice.title;
            transactionCreate.properties = {
                Status: 'FAILED_PROCESSING',
                Type: type,
                CurrencyCode: getProperty(invoice, 'CurrencyCode'),
                Amount: 0,
                ExternalRef: 'NA',
                ErrorMessage: error,
            };
            transactionCreate.associations = paymentMethod ? [
                { recordId: paymentMethod.id },
                { recordId: invoice.id },
            ] : [ { recordId: invoice.id } ];

            const transaction = await this.dbService.updateOrCreateDbRecordsByPrincipal(
                principal,
                [ transactionCreate ],
                { upsert: true },
            );

            const update = new DbRecordCreateUpdateDto();
            update.entity = `${BILLING_MODULE}:${INVOICE}`;
            update.properties = {
                Status: 'ERROR',
            };
            await this.dbService.updateDbRecordsByPrincipalAndId(principal, invoice.id, update);


            return transaction;

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }

    /**
     *
     * @param invoice
     * @param payment
     * @param contact
     * @param paymentMethod
     * @param principal
     */
    private async createPaymentSuccessTransaction(
        principal: OrganizationUserEntity,
        invoice: DbRecordEntityTransform,
        payment: GocardlessPaymentEntity,
        contact: DbRecordEntityTransform,
        paymentMethod: any,
    ) {
        try {
            const transactionCreate = new DbRecordCreateUpdateDto();
            transactionCreate.entity = `${SchemaModuleTypeEnums.BILLING_MODULE}:${SchemaModuleEntityTypeEnums.TRANSACTION}`;
            transactionCreate.title = invoice.title;
            transactionCreate.properties = {
                Status: payment.status ? payment.status.toUpperCase() : 'NA',
                Type: 'PAYMENT',
                CurrencyCode: getProperty(invoice, 'CurrencyCode'),
                Amount: Number(payment.amount) / 100,
                ExternalRef: payment.id,
            };
            transactionCreate.associations = [
                {
                    recordId: paymentMethod.id,
                },
                {
                    recordId: invoice.id,
                },
            ];

            return await this.dbService.updateOrCreateDbRecordsByPrincipal(
                principal,
                [ transactionCreate ],
                { upsert: true },
            );
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }

    /**
     *
     * @param invoice
     * @param refund
     * @param contact
     * @param principal
     */
    private async createRefundSuccessTransaction(
        principal: OrganizationUserEntity,
        invoice: DbRecordEntityTransform,
        refund: GocardlessRefundEntity,
        contact: DbRecordEntityTransform,
    ) {
        try {
            const transactionCreate = new DbRecordCreateUpdateDto();
            transactionCreate.entity = `${SchemaModuleTypeEnums.BILLING_MODULE}:${SchemaModuleEntityTypeEnums.TRANSACTION}`;
            transactionCreate.title = invoice.title;
            transactionCreate.properties = {
                Status: 'REFUND_APPLIED',
                Type: 'REFUND',
                CurrencyCode: getProperty(invoice, 'CurrencyCode'),
                Amount: Number(refund.amount) / 100,
                ExternalRef: refund.id,
            };
            transactionCreate.associations = [
                {
                    recordId: invoice.id,
                },
            ];

            return await this.dbService.updateOrCreateDbRecordsByPrincipal(
                principal,
                [ transactionCreate ],
                { upsert: true },
            );
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }
}
