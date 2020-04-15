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
import * as ORDER_ITEM from './orders/items/order.item.entity';
import * as ORDER from './orders/order.entity';
import * as RETURN_ORDER from './return-orders/return.order.entity';

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

    public initialize(principal: OrganizationUserEntity, headers): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {

                const initializeResults = [];

                const contactSchema = await this.schemasService.getSchemaByOrganizationAndEntity(
                    principal.organization,
                    `${SchemaModuleTypeEnums.CRM_MODULE}:${SchemaModuleEntityTypeEnums.CONTACT}`,
                );
                const addressSchema = await this.schemasService.getSchemaByOrganizationAndEntity(
                    principal.organization,
                    `${SchemaModuleTypeEnums.CRM_MODULE}:${SchemaModuleEntityTypeEnums.ADDRESS}`,
                );
                const accountSchema = await this.schemasService.getSchemaByOrganizationAndEntity(
                    principal.organization,
                    `${SchemaModuleTypeEnums.CRM_MODULE}:${SchemaModuleEntityTypeEnums.ACCOUNT}`,
                );
                const noteSchema = await this.schemasService.getSchemaByOrganizationAndEntity(
                    principal.organization,
                    `${SchemaModuleTypeEnums.SUPPORT_MODULE}:Note`,
                );

                const productSchema = await this.schemasService.getSchemaByOrganizationAndEntity(
                    principal.organization,
                    `${SchemaModuleTypeEnums.PRODUCT_MODULE}:${SchemaModuleEntityTypeEnums.PRODUCT}`,
                );

                /**
                 *  Create Order Schema
                 */
                const orderSchemaCreate = new SchemaCreateUpdateDto();

                orderSchemaCreate.name = SchemaModuleEntityTypes.ORDER.name;
                orderSchemaCreate.description = 'orders for the order module.';
                orderSchemaCreate.moduleName = SchemaModuleTypeEnums.ORDER_MODULE;
                orderSchemaCreate.entityName = SchemaModuleEntityTypes.ORDER.label;
                orderSchemaCreate.recordNumber = 1;
                orderSchemaCreate.recordNumberPrefix = SchemaModuleEntityTypes.ORDER.prefix;
                orderSchemaCreate.isSequential = true;
                orderSchemaCreate.isStatic = true;
                orderSchemaCreate.isHidden = false;
                orderSchemaCreate.hasTitle = true;
                orderSchemaCreate.position = 0;
                orderSchemaCreate.searchUrl = dbRecordUrlConstants.searchUrl;
                orderSchemaCreate.getUrl = dbRecordUrlConstants.getUrl;
                orderSchemaCreate.postUrl = dbRecordUrlConstants.postUrl;
                orderSchemaCreate.putUrl = dbRecordUrlConstants.putUrl;

                const orderSchema = await this.schemasService.createSchemaByPrincipal(
                    principal,
                    orderSchemaCreate,
                    { upsert: true },
                );
                const orderColumns = await this.schemasColumnsService.updateOrCreateByPrincipal(
                    principal,
                    orderSchema.id,
                    ORDER.columns,
                );
                initializeResults.push({
                    orderColumns,
                });

                /**
                 *  Create order items schema
                 */
                const orderItemSchemaCreate = new SchemaCreateUpdateDto();

                orderItemSchemaCreate.name = SchemaModuleEntityTypes.ORDER_ITEM.name;
                orderItemSchemaCreate.description = 'orders items for the order module.';
                orderItemSchemaCreate.moduleName = SchemaModuleTypeEnums.ORDER_MODULE;
                orderItemSchemaCreate.entityName = SchemaModuleEntityTypes.ORDER_ITEM.label;
                orderItemSchemaCreate.recordNumber = 1;
                orderItemSchemaCreate.recordNumberPrefix = SchemaModuleEntityTypes.ORDER_ITEM.prefix;
                orderItemSchemaCreate.isSequential = true;
                orderItemSchemaCreate.isStatic = true;
                orderItemSchemaCreate.isHidden = false;
                orderItemSchemaCreate.hasTitle = true;
                orderItemSchemaCreate.position = 0;
                orderItemSchemaCreate.searchUrl = dbRecordUrlConstants.searchUrl;
                orderItemSchemaCreate.getUrl = dbRecordUrlConstants.getUrl;
                orderItemSchemaCreate.postUrl = dbRecordUrlConstants.postUrl;
                orderItemSchemaCreate.putUrl = dbRecordUrlConstants.putUrl;
                orderItemSchemaCreate.deleteUrl = dbRecordUrlConstants.deleteUrl;

                const orderItemSchema = await this.schemasService.createSchemaByPrincipal(
                    principal,
                    orderItemSchemaCreate,
                    { upsert: true },
                );
                const orderItemsColumns = await this.schemasColumnsService.updateOrCreateByPrincipal(
                    principal,
                    orderItemSchema.id,
                    ORDER_ITEM.columns,
                );
                initializeResults.push({
                    orderItemsColumns,
                });

                /**
                 *  Create Return Order Schema
                 */
                const returnOrderSchemaCreate = new SchemaCreateUpdateDto();

                returnOrderSchemaCreate.name = SchemaModuleEntityTypes.RETURN_ORDER.name;
                returnOrderSchemaCreate.description = 'return orders for the order module.';
                returnOrderSchemaCreate.moduleName = SchemaModuleTypeEnums.ORDER_MODULE;
                returnOrderSchemaCreate.entityName = SchemaModuleEntityTypes.RETURN_ORDER.label;
                returnOrderSchemaCreate.recordNumber = 1;
                returnOrderSchemaCreate.recordNumberPrefix = SchemaModuleEntityTypes.RETURN_ORDER.prefix;
                returnOrderSchemaCreate.isSequential = true;
                returnOrderSchemaCreate.isStatic = true;
                returnOrderSchemaCreate.isHidden = false;
                returnOrderSchemaCreate.hasTitle = true;
                returnOrderSchemaCreate.position = 0;
                returnOrderSchemaCreate.searchUrl = dbRecordUrlConstants.searchUrl;
                returnOrderSchemaCreate.getUrl = dbRecordUrlConstants.getUrl;
                returnOrderSchemaCreate.postUrl = dbRecordUrlConstants.postUrl;
                returnOrderSchemaCreate.putUrl = dbRecordUrlConstants.putUrl;

                const returnOrderSchema = await this.schemasService.createSchemaByPrincipal(
                    principal,
                    returnOrderSchemaCreate,
                    { upsert: true },
                );
                const returnOrderColumns = await this.schemasColumnsService.updateOrCreateByPrincipal(
                    principal,
                    returnOrderSchema.id,
                    RETURN_ORDER.columns,
                );
                initializeResults.push({
                    returnOrderColumns,
                });

                //
                // Create an association Order -> Note
                //
                const orderNotesAssociation = new SchemaAssociationCreateUpdateDto();
                orderNotesAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
                orderNotesAssociation.childSchemaId = noteSchema.id;
                orderNotesAssociation.isStatic = true;
                orderNotesAssociation.parentActions = 'CREATE_ONLY';
                orderNotesAssociation.childActions = 'CREATE_ONLY';
                orderNotesAssociation.cascadeDeleteChildRecord = true;
                orderNotesAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
                orderNotesAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
                orderNotesAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
                orderNotesAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

                try {
                    await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                        principal,
                        orderSchema.id,
                        orderNotesAssociation,
                    );
                    initializeResults.push({
                        orderNotesAssociation: 1,
                    });
                } catch (e) {
                    console.error(e);
                }

                //
                // Create an association Order -> Contact
                //
                const orderContactAssociation = new SchemaAssociationCreateUpdateDto();
                orderContactAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_ONE;
                orderContactAssociation.childSchemaId = contactSchema.id;
                orderContactAssociation.isStatic = true;
                orderContactAssociation.parentActions = 'LOOKUP_ONLY';
                orderContactAssociation.childActions = 'CREATE_ONLY';
                orderContactAssociation.cascadeDeleteChildRecord = true;
                orderContactAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
                orderContactAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
                orderContactAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
                orderContactAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

                try {
                    await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                        principal,
                        orderSchema.id,
                        orderContactAssociation,
                    );
                    initializeResults.push({
                        orderContactAssociation: 1,
                    });
                } catch (e) {
                    console.error(e);
                }

                //
                // Create an association Order ->Address
                //
                const orderAddressAssociation = new SchemaAssociationCreateUpdateDto();
                orderAddressAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_ONE;
                orderAddressAssociation.childSchemaId = addressSchema.id;
                orderAddressAssociation.isStatic = true;
                orderAddressAssociation.parentActions = 'CREATE_ONLY';
                orderAddressAssociation.childActions = 'CREATE_ONLY';
                orderAddressAssociation.cascadeDeleteChildRecord = true;
                orderAddressAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
                orderAddressAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
                orderAddressAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
                orderAddressAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

                try {
                    await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                        principal,
                        orderSchema.id,
                        orderAddressAssociation,
                    );
                    initializeResults.push({
                        orderAddressAssociation: 1,
                    });
                } catch (e) {
                    console.error(e);
                }

                //
                // Create an association Order -> Order Items
                //
                const orderItemAssociation = new SchemaAssociationCreateUpdateDto();
                orderItemAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
                orderItemAssociation.childSchemaId = orderItemSchema.id;
                orderItemAssociation.parentActions = 'CREATE_ONLY';
                orderItemAssociation.childActions = 'READ_ONLY';
                orderItemAssociation.cascadeDeleteChildRecord = true;
                orderItemAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
                orderItemAssociation.postUrl = `${process.env.MODULE_NAME}/v1.0/orders/{recordId}/items`;
                orderItemAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
                orderItemAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

                try {
                    await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                        principal,
                        orderSchema.id,
                        orderItemAssociation,
                    );
                } catch (e) {
                    console.error(e);
                }

                initializeResults.push({
                    orderAssociationCreated: 1,
                });

                //
                // Create an association Order Item -> Product
                //

                const productAssociation = new SchemaAssociationCreateUpdateDto();
                productAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_ONE;
                productAssociation.childSchemaId = productSchema.id;
                productAssociation.isStatic = true;
                productAssociation.parentActions = 'READ_ONLY';
                productAssociation.childActions = 'READ_ONLY';
                productAssociation.cascadeDeleteChildRecord = false;
                productAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
                productAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
                productAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
                productAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

                try {
                    await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                        principal,
                        orderItemSchema.id,
                        productAssociation,
                    );
                } catch (e) {
                    console.error(e);
                }

                initializeResults.push({
                    productAssociationCreated: 1,
                });

                //
                // Create an association Return Return Order -> Order
                //
                const returnOrderOrderAssociation = new SchemaAssociationCreateUpdateDto();
                returnOrderOrderAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
                returnOrderOrderAssociation.childSchemaId = orderSchema.id;
                returnOrderOrderAssociation.isStatic = true;
                returnOrderOrderAssociation.parentActions = 'CREATE_ONLY';
                returnOrderOrderAssociation.childActions = 'CREATE_ONLY';
                returnOrderOrderAssociation.cascadeDeleteChildRecord = false;
                returnOrderOrderAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
                returnOrderOrderAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
                returnOrderOrderAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
                returnOrderOrderAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

                try {
                    await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                        principal,
                        returnOrderSchema.id,
                        returnOrderOrderAssociation,
                    );
                } catch (e) {
                    console.error(e);
                }

                initializeResults.push({
                    returnOrderOrderAssociation: 1,
                });

                //
                // Create an association Return Order ->  Order Item
                //
                const returnOrderReturnOrderItemAssociation = new SchemaAssociationCreateUpdateDto();
                returnOrderReturnOrderItemAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
                returnOrderReturnOrderItemAssociation.childSchemaId = orderItemSchema.id;
                returnOrderReturnOrderItemAssociation.isStatic = true;
                returnOrderReturnOrderItemAssociation.parentActions = 'LOOKUP_ONLY';
                returnOrderReturnOrderItemAssociation.childActions = 'READ_ONLY';
                returnOrderReturnOrderItemAssociation.cascadeDeleteChildRecord = false;
                returnOrderReturnOrderItemAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
                returnOrderReturnOrderItemAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
                returnOrderReturnOrderItemAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
                returnOrderReturnOrderItemAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

                try {
                    await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                        principal,
                        returnOrderSchema.id,
                        returnOrderReturnOrderItemAssociation,
                    );
                } catch (e) {
                    console.error(e);
                }

                initializeResults.push({
                    returnOrderOrderItemAssociation: 1,
                });

                //
                // Create an association Account -> Order
                //
                const accountOrderAssociation = new SchemaAssociationCreateUpdateDto();
                accountOrderAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
                accountOrderAssociation.childSchemaId = orderSchema.id;
                accountOrderAssociation.parentActions = 'LOOKUP_AND_CREATE';
                accountOrderAssociation.childActions = 'CREATE_ONLY';
                accountOrderAssociation.cascadeDeleteChildRecord = false;
                accountOrderAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
                accountOrderAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
                accountOrderAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
                accountOrderAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

                try {
                    await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                        principal,
                        accountSchema.id,
                        accountOrderAssociation,
                    );
                    initializeResults.push({
                        accountOrderAssociation: 1,
                    });
                } catch (e) {
                    console.error(e);
                }

                return resolve(initializeResults);
            } catch (e) {
                console.error(e);
                return reject(new ExceptionType(e.statusCode, e.message, e.validation));
            }
        });
    }
}
