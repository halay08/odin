import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { SchemaAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/schema/association/dto/schema.association.create.update.dto';
import { SchemaAssociationCardinalityTypes } from '@d19n/models/dist/schema-manager/schema/association/types/schema.association.cardinality.types';
import { SchemaCreateUpdateDto } from '@d19n/models/dist/schema-manager/schema/dto/schema.create.update.dto';
import {
    SchemaModuleEntityTypeEnums,
    SchemaModuleEntityTypes,
} from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { SchemasAssociationsService } from '@d19n/schema-manager/dist/schemas/associations/schemas.associations.service';
import { SchemasColumnsService } from '@d19n/schema-manager/dist/schemas/columns/schemas.columns.service';
import { SchemasService } from '@d19n/schema-manager/dist/schemas/schemas.service';
import { dbRecordAssociationUrlConstants, dbRecordUrlConstants } from '@d19n/schema-manager/dist/schemas/url.constants';
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as INVOICE_ITEMS from './invoices/items/types/invoice.item.entity';
import * as INVOICE from './invoices/types/invoice.entity';
import * as PAYMENT_METHODS from './payment-methods/types/payment.method.entity';
import * as TRANSACTION from './transactions/types/transaction.entity';

dotenv.config();

@Injectable()
export class InitializeService {

    private schemasService: SchemasService;
    private schemasColumnsService: SchemasColumnsService;
    private schemasAssociationsService: SchemasAssociationsService;

    constructor(
        schemasService: SchemasService,
        schemasColumnsService: SchemasColumnsService,
        schemasAssociationsService: SchemasAssociationsService,
    ) {
        this.schemasService = schemasService;
        this.schemasColumnsService = schemasColumnsService;
        this.schemasAssociationsService = schemasAssociationsService;
    }


    public initialize(principal: OrganizationUserEntity, headers: any): Promise<any> {

        return new Promise(async (resolve, reject) => {

            try {

                const contactSchema = await this.schemasService.getSchemaByOrganizationAndEntity(
                    principal.organization,
                    `${SchemaModuleTypeEnums.CRM_MODULE}:${SchemaModuleEntityTypeEnums.CONTACT}`,
                );
                const addressSchema = await this.schemasService.getSchemaByOrganizationAndEntity(
                    principal.organization,
                    `${SchemaModuleTypeEnums.CRM_MODULE}:${SchemaModuleEntityTypeEnums.ADDRESS}`,
                );
                const orderSchema = await this.schemasService.getSchemaByOrganizationAndEntity(
                    principal.organization,
                    `${SchemaModuleTypeEnums.ORDER_MODULE}:${SchemaModuleEntityTypeEnums.ORDER}`,
                );

                const noteSchema = await this.schemasService.getSchemaByOrganizationAndEntity(
                    principal.organization,
                    `${SchemaModuleTypeEnums.SUPPORT_MODULE}:${SchemaModuleEntityTypeEnums.NOTE}`,
                );

                const discountSchema = await this.schemasService.getSchemaByOrganizationAndEntity(
                    principal.organization,
                    `${SchemaModuleTypeEnums.PRODUCT_MODULE}:${SchemaModuleEntityTypeEnums.DISCOUNT}`,
                );

                let initializeResults = [];

                /**
                 *  Create Payment Method Schema
                 */
                const paymentMethodCreate = new SchemaCreateUpdateDto();

                paymentMethodCreate.name = SchemaModuleEntityTypes.PAYMENT_METHOD.name;
                paymentMethodCreate.description = 'payment methods for the billing module.';
                paymentMethodCreate.moduleName = SchemaModuleTypeEnums.BILLING_MODULE;
                paymentMethodCreate.entityName = SchemaModuleEntityTypeEnums.PAYMENT_METHOD;
                paymentMethodCreate.isSequential = false;
                paymentMethodCreate.isStatic = true;
                paymentMethodCreate.isHidden = false;
                paymentMethodCreate.hasTitle = true;
                paymentMethodCreate.position = 0;
                paymentMethodCreate.searchUrl = dbRecordUrlConstants.searchUrl;
                paymentMethodCreate.getUrl = dbRecordUrlConstants.getUrl;
                paymentMethodCreate.postUrl = dbRecordUrlConstants.postUrl;
                paymentMethodCreate.putUrl = dbRecordUrlConstants.putUrl;
                paymentMethodCreate.deleteUrl = dbRecordUrlConstants.deleteUrl;

                const paymentMethodSchema = await this.schemasService.createSchemaByPrincipal(
                    principal,
                    paymentMethodCreate,
                    { upsert: true },
                );
                const paymentMethodColumns = await this.schemasColumnsService.updateOrCreateByPrincipal(
                    principal,
                    paymentMethodSchema.id,
                    PAYMENT_METHODS.columns,
                );

                initializeResults.push({
                    paymentMethodColumns,
                });


                /**
                 *  Create invoice schema
                 */
                const invoiceSchemaCreate = new SchemaCreateUpdateDto();

                invoiceSchemaCreate.name = SchemaModuleEntityTypes.INVOICE.name;
                invoiceSchemaCreate.description = 'invoice for the billing module.';
                invoiceSchemaCreate.moduleName = SchemaModuleTypeEnums.BILLING_MODULE;
                invoiceSchemaCreate.entityName = SchemaModuleEntityTypeEnums.INVOICE;
                invoiceSchemaCreate.recordNumber = 1;
                invoiceSchemaCreate.recordNumberPrefix = SchemaModuleEntityTypes.INVOICE.prefix;
                invoiceSchemaCreate.isSequential = true;
                invoiceSchemaCreate.isStatic = true;
                invoiceSchemaCreate.isHidden = false;
                invoiceSchemaCreate.hasTitle = true;
                invoiceSchemaCreate.position = 0;
                invoiceSchemaCreate.searchUrl = dbRecordUrlConstants.searchUrl;
                invoiceSchemaCreate.getUrl = dbRecordUrlConstants.getUrl;
                invoiceSchemaCreate.postUrl = dbRecordUrlConstants.postUrl;
                invoiceSchemaCreate.putUrl = dbRecordUrlConstants.putUrl;
                invoiceSchemaCreate.deleteUrl = dbRecordUrlConstants.deleteUrl;

                const invoiceSchema = await this.schemasService.createSchemaByPrincipal(
                    principal,
                    invoiceSchemaCreate,
                    { upsert: true },
                );
                const invoiceColumns = await this.schemasColumnsService.updateOrCreateByPrincipal(
                    principal,
                    invoiceSchema.id,
                    INVOICE.columns,
                );

                initializeResults.push({
                    invoiceColumns,
                });

                /**
                 *  Create invoice items schema
                 */
                const invoiceItemsSchemaCreate = new SchemaCreateUpdateDto();

                invoiceItemsSchemaCreate.name = SchemaModuleEntityTypes.INVOICE_ITEM.name;
                invoiceItemsSchemaCreate.description = 'invoice items for the billing module.';
                invoiceItemsSchemaCreate.moduleName = SchemaModuleTypeEnums.BILLING_MODULE;
                invoiceItemsSchemaCreate.entityName = SchemaModuleEntityTypeEnums.INVOICE_ITEM;
                invoiceItemsSchemaCreate.recordNumber = 1;
                invoiceItemsSchemaCreate.recordNumberPrefix = SchemaModuleEntityTypes.INVOICE_ITEM.prefix;
                invoiceItemsSchemaCreate.isSequential = true;
                invoiceItemsSchemaCreate.isStatic = true;
                invoiceItemsSchemaCreate.isHidden = false;
                invoiceItemsSchemaCreate.hasTitle = true;
                invoiceItemsSchemaCreate.position = 0;
                invoiceItemsSchemaCreate.searchUrl = dbRecordUrlConstants.searchUrl;
                invoiceItemsSchemaCreate.getUrl = dbRecordUrlConstants.getUrl;
                invoiceItemsSchemaCreate.postUrl = dbRecordUrlConstants.postUrl;
                invoiceItemsSchemaCreate.putUrl = dbRecordUrlConstants.putUrl;
                invoiceItemsSchemaCreate.deleteUrl = dbRecordUrlConstants.deleteUrl;

                const invoiceItemSchema = await this.schemasService.createSchemaByPrincipal(
                    principal,
                    invoiceItemsSchemaCreate,
                    { upsert: true },
                );
                const invoiceItemColumns = await this.schemasColumnsService.updateOrCreateByPrincipal(
                    principal,
                    invoiceItemSchema.id,
                    INVOICE_ITEMS.columns,
                );

                initializeResults.push({
                    invoiceItemColumns,
                });

                /**
                 *  Create Transaction Schema
                 */
                const transactionSchemaCreate = new SchemaCreateUpdateDto();

                transactionSchemaCreate.name = 'transaction';
                transactionSchemaCreate.description = 'payment methods for the billing module.';
                transactionSchemaCreate.moduleName = SchemaModuleTypeEnums.BILLING_MODULE;
                transactionSchemaCreate.entityName = SchemaModuleEntityTypeEnums.TRANSACTION;
                transactionSchemaCreate.isSequential = true;
                transactionSchemaCreate.isStatic = true;
                transactionSchemaCreate.isHidden = false;
                transactionSchemaCreate.hasTitle = true;
                transactionSchemaCreate.position = 0;
                transactionSchemaCreate.recordNumber = 1;
                transactionSchemaCreate.recordNumberPrefix = 'TN';
                transactionSchemaCreate.searchUrl = dbRecordUrlConstants.searchUrl;
                transactionSchemaCreate.getUrl = dbRecordUrlConstants.getUrl;
                transactionSchemaCreate.postUrl = dbRecordUrlConstants.postUrl;
                transactionSchemaCreate.putUrl = dbRecordUrlConstants.putUrl;
                transactionSchemaCreate.deleteUrl = dbRecordUrlConstants.deleteUrl;

                const transactionSchema = await this.schemasService.createSchemaByPrincipal(
                    principal,
                    transactionSchemaCreate,
                    { upsert: true },
                );
                const transactionSchemaColumns = await this.schemasColumnsService.updateOrCreateByPrincipal(
                    principal,
                    transactionSchema.id,
                    TRANSACTION.columns,
                );
                initializeResults.push({
                    transactionSchemaColumns,
                });


                //
                // Create an association Contact -> Payment Methods
                //
                // Create the association
                const paymentMethodAssociation = new SchemaAssociationCreateUpdateDto();
                paymentMethodAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
                paymentMethodAssociation.childSchemaId = paymentMethodSchema.id;
                paymentMethodAssociation.isStatic = true;
                paymentMethodAssociation.parentActions = 'CREATE_ONLY';
                paymentMethodAssociation.childActions = 'READ_ONLY';
                paymentMethodAssociation.cascadeDeleteChildRecord = true;
                paymentMethodAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
                paymentMethodAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
                paymentMethodAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
                paymentMethodAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

                try {
                    await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                        principal,
                        contactSchema.id,
                        paymentMethodAssociation,
                    );
                    initializeResults.push({
                        paymentMethodAssociation: 1,
                    });
                } catch (e) {
                    console.error(e);
                }

                //
                // Create an association Invoice -> Invoice Items
                //
                const invoiceItemAssociation = new SchemaAssociationCreateUpdateDto();
                invoiceItemAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
                invoiceItemAssociation.childSchemaId = invoiceItemSchema.id;
                invoiceItemAssociation.isStatic = true;
                invoiceItemAssociation.parentActions = 'READ_ONLY';
                invoiceItemAssociation.childActions = 'READ_ONLY';
                invoiceItemAssociation.cascadeDeleteChildRecord = true;
                invoiceItemAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
                invoiceItemAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
                invoiceItemAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
                invoiceItemAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

                try {
                    await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                        principal,
                        invoiceSchema.id,
                        invoiceItemAssociation,
                    );

                    initializeResults.push({
                        invoiceItemAssociation: 1,
                    })
                } catch (e) {
                    console.error(e);
                }

                //
                // Create an association Invoice -> Transaction
                //
                const invoiceTransactionAssociation = new SchemaAssociationCreateUpdateDto();
                invoiceTransactionAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
                invoiceTransactionAssociation.childSchemaId = transactionSchema.id;
                invoiceTransactionAssociation.isStatic = true;
                invoiceTransactionAssociation.parentActions = 'CREATE_ONLY';
                invoiceTransactionAssociation.childActions = 'READ_ONLY';
                invoiceTransactionAssociation.cascadeDeleteChildRecord = true;
                invoiceTransactionAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
                invoiceTransactionAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
                invoiceTransactionAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
                invoiceTransactionAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

                try {
                    await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                        principal,
                        invoiceSchema.id,
                        invoiceTransactionAssociation,
                    );
                    initializeResults.push({
                        invoiceTransactionAssociation: 1,
                    });
                } catch (e) {
                    console.error(e);
                }

                //
                // Create an association Invoice -> Note
                //
                const invoiceNoteAssociation = new SchemaAssociationCreateUpdateDto();
                invoiceNoteAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
                invoiceNoteAssociation.childSchemaId = noteSchema.id;
                invoiceNoteAssociation.isStatic = true;
                invoiceNoteAssociation.parentActions = 'CREATE_ONLY';
                invoiceNoteAssociation.childActions = 'READ_ONLY';
                invoiceNoteAssociation.cascadeDeleteChildRecord = false;
                invoiceNoteAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
                invoiceNoteAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
                invoiceNoteAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
                invoiceNoteAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

                try {
                    await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                        principal,
                        invoiceSchema.id,
                        invoiceNoteAssociation,
                    );
                    initializeResults.push({
                        invoiceNoteAssociation: 1,
                    });
                } catch (e) {
                    console.error(e);
                }

                //
                // Create an association Transaction -> PaymentMethod
                //
                const transactionPaymentMethodAssociation = new SchemaAssociationCreateUpdateDto();
                transactionPaymentMethodAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_ONE;
                transactionPaymentMethodAssociation.childSchemaId = paymentMethodSchema.id;
                transactionPaymentMethodAssociation.isStatic = true;
                transactionPaymentMethodAssociation.parentActions = 'LOOKUP_ONLY';
                transactionPaymentMethodAssociation.childActions = 'READ_ONLY';
                transactionPaymentMethodAssociation.cascadeDeleteChildRecord = false;
                transactionPaymentMethodAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
                transactionPaymentMethodAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
                transactionPaymentMethodAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
                transactionPaymentMethodAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

                try {
                    await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                        principal,
                        transactionSchema.id,
                        transactionPaymentMethodAssociation,
                    );
                    initializeResults.push({
                        transactionPaymentMethodAssociation: 1,
                    });
                } catch (e) {
                    console.error(e);
                }

                //
                // Create an association Invoice -> Contact
                //
                const invoiceContactAssociation = new SchemaAssociationCreateUpdateDto();
                invoiceContactAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_ONE;
                invoiceContactAssociation.childSchemaId = contactSchema.id;
                invoiceContactAssociation.isStatic = true;
                invoiceContactAssociation.parentActions = 'LOOKUP_ONLY';
                invoiceContactAssociation.childActions = 'READ_ONLY';
                invoiceContactAssociation.cascadeDeleteChildRecord = false;
                invoiceContactAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
                invoiceContactAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
                invoiceContactAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
                invoiceContactAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

                try {
                    await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                        principal,
                        invoiceSchema.id,
                        invoiceContactAssociation,
                    );
                    initializeResults.push({
                        invoiceContactAssociation: 1,
                    });
                } catch (e) {
                    console.error(e);
                }

                //
                // Create an association Invoice -> Address
                //
                const invoiceAddressAssociation = new SchemaAssociationCreateUpdateDto();
                invoiceAddressAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_ONE;
                invoiceAddressAssociation.childSchemaId = addressSchema.id;
                invoiceAddressAssociation.isStatic = true;
                invoiceAddressAssociation.parentActions = 'LOOKUP_ONLY';
                invoiceAddressAssociation.childActions = 'READ_ONLY';
                invoiceAddressAssociation.cascadeDeleteChildRecord = false;
                invoiceAddressAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
                invoiceAddressAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
                invoiceAddressAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
                invoiceAddressAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

                try {
                    await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                        principal,
                        invoiceSchema.id,
                        invoiceAddressAssociation,
                    );
                    initializeResults.push({
                        invoiceAddressAssociation: 1,
                    });
                } catch (e) {
                    console.error(e);
                }

                //
                // Create an association Invoice -> Discount
                //
                const invoiceDiscountAssociation = new SchemaAssociationCreateUpdateDto();
                invoiceDiscountAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_ONE;
                invoiceDiscountAssociation.childSchemaId = discountSchema.id;
                invoiceDiscountAssociation.isStatic = true;
                invoiceDiscountAssociation.parentActions = 'LOOKUP_AND_CREATE';
                invoiceDiscountAssociation.childActions = 'READ_ONLY';
                invoiceDiscountAssociation.cascadeDeleteChildRecord = false;
                invoiceDiscountAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
                invoiceDiscountAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
                invoiceDiscountAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
                invoiceDiscountAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

                try {
                    await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                        principal,
                        invoiceSchema.id,
                        invoiceDiscountAssociation,
                    );
                    initializeResults.push({
                        invoiceDiscountAssociation: 1,
                    });
                } catch (e) {
                    console.error(e);
                }


                //
                // Create an association Order -> Invoice
                //
                const orderInvoiceAssociation = new SchemaAssociationCreateUpdateDto();
                orderInvoiceAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
                orderInvoiceAssociation.childSchemaId = invoiceSchema.id;
                orderInvoiceAssociation.isStatic = true;
                orderInvoiceAssociation.parentActions = 'CREATE_ONLY';
                orderInvoiceAssociation.childActions = 'CREATE_ONLY';
                orderInvoiceAssociation.cascadeDeleteChildRecord = true;
                orderInvoiceAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
                orderInvoiceAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
                orderInvoiceAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
                orderInvoiceAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

                try {
                    await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                        principal,
                        orderSchema.id,
                        orderInvoiceAssociation,
                    );
                    initializeResults.push({
                        orderInvoiceAssociation: 1,
                    });
                } catch (e) {
                    console.error(e);
                }


                return resolve(initializeResults);
            } catch (e) {
                console.error(e);
                return reject(new ExceptionType(500, e.message));
            }

        });
    }
}
