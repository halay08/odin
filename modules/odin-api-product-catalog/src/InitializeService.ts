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
import * as CONSUMPTION_RATE from './consumption/rates/consumption.rate.entity';
import * as CONSUMPTION_SCHEDULE from './consumption/schedules/consumption.schedule.entity';
import * as DISCOUNT from './discounts/discount.entity';
import * as OFFER from './offers/offer.entity';
import * as PRICE_BOOK from './pricebook/pricebook.entity';
import * as PRODUCT_COMPONENT from './products/components/product.component.entity';
import * as PRODUCT from './products/product.entity';
import * as RESTRICTION from './restrictions/restriction.entity';
import * as VENDOR from './vendors/vendor.entity';

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

                const leadSchema = await this.schemasService.getSchemaByOrganizationAndEntity(
                    principal.organization,
                    `${SchemaModuleTypeEnums.CRM_MODULE}:${SchemaModuleEntityTypeEnums.LEAD}`,
                );

                let initializeResults = [];
                /**
                 *  Create Vendor Schema
                 */
                const vendorSchemaCreate = new SchemaCreateUpdateDto();
                vendorSchemaCreate.name = 'vendor';
                vendorSchemaCreate.description = 'vendors for the product module.';
                vendorSchemaCreate.moduleName = SchemaModuleTypeEnums.PRODUCT_MODULE;
                vendorSchemaCreate.entityName = 'Vendor';
                vendorSchemaCreate.recordNumber = 1;
                vendorSchemaCreate.recordNumberPrefix = 'VND';
                vendorSchemaCreate.isSequential = true;
                vendorSchemaCreate.isStatic = true;
                vendorSchemaCreate.isHidden = false;
                vendorSchemaCreate.hasTitle = true;
                vendorSchemaCreate.isTitleUnique = true;
                vendorSchemaCreate.position = 0;
                vendorSchemaCreate.searchUrl = dbRecordUrlConstants.searchUrl;
                vendorSchemaCreate.getUrl = dbRecordUrlConstants.getUrl;
                vendorSchemaCreate.postUrl = dbRecordUrlConstants.postUrl;
                vendorSchemaCreate.putUrl = dbRecordUrlConstants.putUrl;
                vendorSchemaCreate.deleteUrl = dbRecordUrlConstants.deleteUrl;

                const vendorSchema = await this.schemasService.createSchemaByPrincipal(
                    principal,
                    vendorSchemaCreate,
                    { upsert: true },
                );
                const vendorColumns = await this.schemasColumnsService.updateOrCreateByPrincipal(
                    principal,
                    vendorSchema.id,
                    VENDOR.columns,
                );
                initializeResults.push({
                    vendorColumns,
                });

                /**
                 *  Create PriceBook Schema
                 */
                const priceBookSchemaCreate = new SchemaCreateUpdateDto();
                priceBookSchemaCreate.name = 'price book';
                priceBookSchemaCreate.description = 'price books for the product module.';
                priceBookSchemaCreate.moduleName = SchemaModuleTypeEnums.PRODUCT_MODULE;
                priceBookSchemaCreate.entityName = 'PriceBook';
                priceBookSchemaCreate.recordNumber = 1;
                priceBookSchemaCreate.recordNumberPrefix = 'PB';
                priceBookSchemaCreate.isSequential = true;
                priceBookSchemaCreate.isStatic = true;
                priceBookSchemaCreate.isHidden = false;
                priceBookSchemaCreate.hasTitle = true;
                priceBookSchemaCreate.isTitleUnique = true;
                priceBookSchemaCreate.position = 0;
                priceBookSchemaCreate.searchUrl = dbRecordUrlConstants.searchUrl;
                priceBookSchemaCreate.getUrl = dbRecordUrlConstants.getUrl;
                priceBookSchemaCreate.postUrl = dbRecordUrlConstants.postUrl;
                priceBookSchemaCreate.putUrl = dbRecordUrlConstants.putUrl;
                priceBookSchemaCreate.deleteUrl = dbRecordUrlConstants.deleteUrl;

                const priceBookSchema = await this.schemasService.createSchemaByPrincipal(
                    principal,
                    priceBookSchemaCreate,
                    { upsert: true },
                );
                const priceBookColumns = await this.schemasColumnsService.updateOrCreateByPrincipal(
                    principal,
                    priceBookSchema.id,
                    PRICE_BOOK.columns,
                );
                initializeResults.push({
                    priceBookColumns,
                });


                /**
                 *  Create Product Schema
                 */
                const productSchemaCreate = new SchemaCreateUpdateDto();
                productSchemaCreate.name = SchemaModuleEntityTypes.PRODUCT.name;
                productSchemaCreate.description = 'products for the product module.';
                productSchemaCreate.moduleName = SchemaModuleTypeEnums.PRODUCT_MODULE;
                productSchemaCreate.entityName = SchemaModuleEntityTypeEnums.PRODUCT;
                productSchemaCreate.recordNumber = 1;
                productSchemaCreate.recordNumberPrefix = SchemaModuleEntityTypes.PRODUCT.prefix;
                productSchemaCreate.isSequential = true;
                productSchemaCreate.isStatic = true;
                productSchemaCreate.isHidden = false;
                productSchemaCreate.hasTitle = true;
                vendorSchemaCreate.isTitleUnique = true;
                productSchemaCreate.position = 0;
                productSchemaCreate.searchUrl = dbRecordUrlConstants.searchUrl;
                productSchemaCreate.getUrl = dbRecordUrlConstants.getUrl;
                productSchemaCreate.postUrl = dbRecordUrlConstants.postUrl;
                productSchemaCreate.putUrl = dbRecordUrlConstants.putUrl;
                productSchemaCreate.deleteUrl = dbRecordUrlConstants.deleteUrl;

                const productSchema = await this.schemasService.createSchemaByPrincipal(
                    principal,
                    productSchemaCreate,
                    { upsert: true },
                );
                const productColumns = await this.schemasColumnsService.updateOrCreateByPrincipal(
                    principal,
                    productSchema.id,
                    PRODUCT.columns,
                );
                initializeResults.push({
                    productColumns,
                });

                /**
                 *  Create product components schema
                 */
                const productComponentSchemaCreate = new SchemaCreateUpdateDto();
                productComponentSchemaCreate.name = SchemaModuleEntityTypes.PRODUCT_COMPONENT.name;
                productComponentSchemaCreate.description = 'product components for the product module.';
                productComponentSchemaCreate.moduleName = SchemaModuleTypeEnums.PRODUCT_MODULE;
                productComponentSchemaCreate.entityName = SchemaModuleEntityTypeEnums.PRODUCT_COMPONENT;
                productComponentSchemaCreate.recordNumber = 1;
                productComponentSchemaCreate.recordNumberPrefix = SchemaModuleEntityTypes.PRODUCT_COMPONENT.prefix;
                productComponentSchemaCreate.isSequential = true;
                productComponentSchemaCreate.isStatic = true;
                productComponentSchemaCreate.isHidden = false;
                productComponentSchemaCreate.hasTitle = true;
                productComponentSchemaCreate.position = 0;
                productComponentSchemaCreate.searchUrl = dbRecordUrlConstants.searchUrl;
                productComponentSchemaCreate.getUrl = dbRecordUrlConstants.getUrl;
                productComponentSchemaCreate.postUrl = dbRecordUrlConstants.postUrl;
                productComponentSchemaCreate.putUrl = dbRecordUrlConstants.putUrl;
                productComponentSchemaCreate.deleteUrl = dbRecordUrlConstants.deleteUrl;

                const productComponentSchema = await this.schemasService.createSchemaByPrincipal(
                    principal,
                    productComponentSchemaCreate,
                    { upsert: true },
                );
                const productComponentColumns = await this.schemasColumnsService.updateOrCreateByPrincipal(
                    principal,
                    productComponentSchema.id,
                    PRODUCT_COMPONENT.columns,
                );
                initializeResults.push({
                    productComponentColumns,
                });


                /**
                 *  Create Offers Schema
                 */
                const offersSchemaCreate = new SchemaCreateUpdateDto();
                offersSchemaCreate.name = SchemaModuleEntityTypes.OFFER.name;
                offersSchemaCreate.description = 'offers for the product module.';
                offersSchemaCreate.moduleName = SchemaModuleTypeEnums.PRODUCT_MODULE;
                offersSchemaCreate.entityName = SchemaModuleEntityTypeEnums.OFFER;
                offersSchemaCreate.recordNumber = 6;
                offersSchemaCreate.recordNumberPrefix = SchemaModuleEntityTypes.OFFER.prefix;
                offersSchemaCreate.isSequential = true;
                offersSchemaCreate.isStatic = true;
                offersSchemaCreate.isHidden = false;
                offersSchemaCreate.hasTitle = true;
                offersSchemaCreate.position = 2;
                offersSchemaCreate.searchUrl = dbRecordUrlConstants.searchUrl;
                offersSchemaCreate.getUrl = dbRecordUrlConstants.getUrl;
                offersSchemaCreate.postUrl = dbRecordUrlConstants.postUrl;
                offersSchemaCreate.putUrl = dbRecordUrlConstants.putUrl;
                offersSchemaCreate.deleteUrl = dbRecordUrlConstants.deleteUrl;

                const offersSchema = await this.schemasService.createSchemaByPrincipal(
                    principal,
                    offersSchemaCreate,
                    { upsert: true },
                );
                const offersColumns = await this.schemasColumnsService.updateOrCreateByPrincipal(
                    principal,
                    offersSchema.id,
                    OFFER.columns,
                );

                initializeResults.push({
                    offersColumns,
                });

                /**
                 *  Create Discount Schema
                 */
                const discountsSchemaCreate = new SchemaCreateUpdateDto();
                discountsSchemaCreate.name = SchemaModuleEntityTypes.DISCOUNT.name;
                discountsSchemaCreate.description = 'discounts for the product module.';
                discountsSchemaCreate.moduleName = SchemaModuleTypeEnums.PRODUCT_MODULE;
                discountsSchemaCreate.entityName = SchemaModuleEntityTypeEnums.DISCOUNT;
                discountsSchemaCreate.isSequential = false;
                discountsSchemaCreate.isStatic = true;
                discountsSchemaCreate.isHidden = false;
                discountsSchemaCreate.hasTitle = true;
                discountsSchemaCreate.position = 3;
                discountsSchemaCreate.searchUrl = dbRecordUrlConstants.searchUrl;
                discountsSchemaCreate.getUrl = dbRecordUrlConstants.getUrl;
                discountsSchemaCreate.postUrl = dbRecordUrlConstants.postUrl;
                discountsSchemaCreate.putUrl = dbRecordUrlConstants.putUrl;
                discountsSchemaCreate.deleteUrl = dbRecordUrlConstants.deleteUrl;

                const discountsSchema = await this.schemasService.createSchemaByPrincipal(
                    principal,
                    discountsSchemaCreate,
                    { upsert: true },
                );
                const discountsColumns = await this.schemasColumnsService.updateOrCreateByPrincipal(
                    principal,
                    discountsSchema.id,
                    DISCOUNT.columns,
                );

                initializeResults.push({
                    discountsColumns,
                });

                /**
                 *  Create Consumption Schedule Schema
                 */
                const consumptionScheduleSchemaCreate = new SchemaCreateUpdateDto();
                consumptionScheduleSchemaCreate.name = SchemaModuleEntityTypes.CONSUMPTION_SCHEDULE.name;
                consumptionScheduleSchemaCreate.description = 'consumption schedule for the product module.';
                consumptionScheduleSchemaCreate.moduleName = SchemaModuleTypeEnums.PRODUCT_MODULE;
                consumptionScheduleSchemaCreate.entityName = SchemaModuleEntityTypeEnums.CONSUMPTION_SCHEDULE;
                consumptionScheduleSchemaCreate.isSequential = false;
                consumptionScheduleSchemaCreate.isStatic = true;
                consumptionScheduleSchemaCreate.isHidden = false;
                consumptionScheduleSchemaCreate.hasTitle = true;
                consumptionScheduleSchemaCreate.position = 4;
                consumptionScheduleSchemaCreate.searchUrl = dbRecordUrlConstants.searchUrl;
                consumptionScheduleSchemaCreate.getUrl = dbRecordUrlConstants.getUrl;
                consumptionScheduleSchemaCreate.postUrl = dbRecordUrlConstants.postUrl;
                consumptionScheduleSchemaCreate.putUrl = dbRecordUrlConstants.putUrl;
                consumptionScheduleSchemaCreate.deleteUrl = dbRecordUrlConstants.deleteUrl;

                const consumptionScheduleSchema = await this.schemasService.createSchemaByPrincipal(
                    principal,
                    consumptionScheduleSchemaCreate,
                    { upsert: true },
                );
                const consumptionScheduleColumns = await this.schemasColumnsService.updateOrCreateByPrincipal(
                    principal,
                    consumptionScheduleSchema.id,
                    CONSUMPTION_SCHEDULE.columns,
                );

                initializeResults.push({
                    consumptionScheduleColumns,
                });

                /**
                 *  Create Consumption Rate Schema
                 */
                const consumptionRateSchemaCreate = new SchemaCreateUpdateDto();
                consumptionRateSchemaCreate.name = SchemaModuleEntityTypes.CONSUMPTION_RATE.name;
                consumptionRateSchemaCreate.description = 'consumption rate for the product module.';
                consumptionRateSchemaCreate.moduleName = SchemaModuleTypeEnums.PRODUCT_MODULE;
                consumptionRateSchemaCreate.entityName = SchemaModuleEntityTypeEnums.CONSUMPTION_RATE;
                consumptionRateSchemaCreate.isSequential = false;
                consumptionRateSchemaCreate.isStatic = true;
                consumptionRateSchemaCreate.isHidden = false;
                consumptionRateSchemaCreate.hasTitle = true;
                consumptionRateSchemaCreate.position = 5;
                consumptionRateSchemaCreate.searchUrl = dbRecordUrlConstants.searchUrl;
                consumptionRateSchemaCreate.getUrl = dbRecordUrlConstants.getUrl;
                consumptionRateSchemaCreate.postUrl = dbRecordUrlConstants.postUrl;
                consumptionRateSchemaCreate.putUrl = dbRecordUrlConstants.putUrl;
                consumptionRateSchemaCreate.deleteUrl = dbRecordUrlConstants.deleteUrl;

                const consumptionRateSchema = await this.schemasService.createSchemaByPrincipal(
                    principal,
                    consumptionRateSchemaCreate,
                    { upsert: true },
                );
                const consumptionRateColumns = await this.schemasColumnsService.updateOrCreateByPrincipal(
                    principal,
                    consumptionRateSchema.id,
                    CONSUMPTION_RATE.columns,
                );

                initializeResults.push({
                    consumptionRateColumns,
                });

                /**
                 * Create Restriction Schema
                 */
                const restrictionSchemaCreate = new SchemaCreateUpdateDto();
                restrictionSchemaCreate.name = SchemaModuleEntityTypes.RESTRICTION.name;
                restrictionSchemaCreate.description = 'restriction for the product module.';
                restrictionSchemaCreate.moduleName = SchemaModuleTypeEnums.PRODUCT_MODULE;
                restrictionSchemaCreate.entityName = SchemaModuleEntityTypeEnums.RESTRICTION;
                restrictionSchemaCreate.recordNumber = 1;
                restrictionSchemaCreate.recordNumberPrefix = SchemaModuleEntityTypes.RESTRICTION.prefix;
                restrictionSchemaCreate.isSequential = true;
                restrictionSchemaCreate.isStatic = true;
                restrictionSchemaCreate.isHidden = false;
                restrictionSchemaCreate.hasTitle = true;
                restrictionSchemaCreate.position = 2;
                restrictionSchemaCreate.searchUrl = dbRecordUrlConstants.searchUrl;
                restrictionSchemaCreate.getUrl = dbRecordUrlConstants.getUrl;
                restrictionSchemaCreate.postUrl = dbRecordUrlConstants.postUrl;
                restrictionSchemaCreate.putUrl = dbRecordUrlConstants.putUrl;
                restrictionSchemaCreate.deleteUrl = dbRecordUrlConstants.deleteUrl;

                const restrictionSchema = await this.schemasService.createSchemaByPrincipal(
                    principal,
                    restrictionSchemaCreate,
                    { upsert: true },
                );
                const restrictionSchemaColumns = await this.schemasColumnsService.updateOrCreateByPrincipal(
                    principal,
                    restrictionSchema.id,
                    RESTRICTION.columns,
                );

                initializeResults.push({
                    restrictionSchemaColumns,
                });

                //
                // Create an association Offer -> Product
                //
                const offerProductAssociation = new SchemaAssociationCreateUpdateDto();
                offerProductAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
                offerProductAssociation.childSchemaId = productSchema.id;
                offerProductAssociation.isStatic = true;
                offerProductAssociation.parentActions = 'LOOKUP_ONLY';
                offerProductAssociation.cascadeDeleteChildRecord = false;
                offerProductAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
                offerProductAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
                offerProductAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
                offerProductAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

                try {
                    await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                        principal,
                        offersSchema.id,
                        offerProductAssociation,
                    );
                } catch (e) {
                    console.error(e);
                }
                initializeResults.push({
                    offerProductAssociation: 1,
                });

                //
                // Create an association Product -> Product Components
                //
                const productAssociation = new SchemaAssociationCreateUpdateDto();
                productAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
                productAssociation.childSchemaId = productComponentSchema.id;
                productAssociation.isStatic = true;
                productAssociation.parentActions = 'LOOKUP_AND_CREATE';
                productAssociation.cascadeDeleteChildRecord = false;
                productAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
                productAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
                productAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
                productAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

                try {
                    await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                        principal,
                        productSchema.id,
                        productAssociation,
                    );
                } catch (e) {
                    console.error(e);
                }
                initializeResults.push({
                    productAssociation: 1,
                });

                //
                // Create an association Product -> Restrictions
                //
                const productRestrictionAssociation = new SchemaAssociationCreateUpdateDto();
                productRestrictionAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
                productRestrictionAssociation.childSchemaId = restrictionSchema.id;
                productRestrictionAssociation.isStatic = true;
                productRestrictionAssociation.parentActions = 'LOOKUP_AND_CREATE';
                productRestrictionAssociation.cascadeDeleteChildRecord = false;
                productRestrictionAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
                productRestrictionAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
                productRestrictionAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
                productRestrictionAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

                try {
                    await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                        principal,
                        productSchema.id,
                        productRestrictionAssociation,
                    );
                } catch (e) {
                    console.error(e);
                }

                initializeResults.push({
                    restrictionAssociation: 1,
                });

                //
                // Create an association Product Component -> Restrictions
                //
                const productComponentRestrictionAssociation = new SchemaAssociationCreateUpdateDto();
                productComponentRestrictionAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
                productComponentRestrictionAssociation.childSchemaId = restrictionSchema.id;
                productComponentRestrictionAssociation.isStatic = true;
                productComponentRestrictionAssociation.parentActions = 'LOOKUP_AND_CREATE';
                productComponentRestrictionAssociation.cascadeDeleteChildRecord = false;
                productComponentRestrictionAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
                productComponentRestrictionAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
                productComponentRestrictionAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
                productComponentRestrictionAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

                try {
                    await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                        principal,
                        productComponentSchema.id,
                        productComponentRestrictionAssociation,
                    );
                } catch (e) {
                    console.error(e);
                }

                initializeResults.push({
                    productComponentRestrictionAssociation: 1,
                });

                //
                // Create an association Product -> Consumption Schedule
                //
                const productConsumptionScheduleAssociation = new SchemaAssociationCreateUpdateDto();
                productConsumptionScheduleAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_ONE;
                productConsumptionScheduleAssociation.childSchemaId = consumptionScheduleSchema.id;
                productConsumptionScheduleAssociation.isStatic = true;
                productConsumptionScheduleAssociation.parentActions = 'LOOKUP_AND_CREATE';
                productConsumptionScheduleAssociation.cascadeDeleteChildRecord = false;
                productConsumptionScheduleAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
                productConsumptionScheduleAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
                productConsumptionScheduleAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
                productConsumptionScheduleAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

                try {
                    await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                        principal,
                        productSchema.id,
                        productConsumptionScheduleAssociation,
                    );
                } catch (e) {
                    console.error(e);
                }

                initializeResults.push({
                    productConsumptionScheduleAssociation: 1,
                });

                //
                // Create an association Consumption Schedule -> Consumption Rate
                //
                const ConsumptionScheduleRateAssociation = new SchemaAssociationCreateUpdateDto();
                ConsumptionScheduleRateAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
                ConsumptionScheduleRateAssociation.childSchemaId = consumptionRateSchema.id;
                ConsumptionScheduleRateAssociation.isStatic = true;
                ConsumptionScheduleRateAssociation.parentActions = 'LOOKUP_AND_CREATE';
                ConsumptionScheduleRateAssociation.cascadeDeleteChildRecord = false;
                ConsumptionScheduleRateAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
                ConsumptionScheduleRateAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
                ConsumptionScheduleRateAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
                ConsumptionScheduleRateAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

                try {
                    await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                        principal,
                        consumptionScheduleSchema.id,
                        ConsumptionScheduleRateAssociation,
                    );
                } catch (e) {
                    console.error(e);
                }

                initializeResults.push({
                    ConsumptionScheduleRateAssociation: 1,
                });

                //
                // Create an association Lead -> Product
                //

                const leadProductAssociation = new SchemaAssociationCreateUpdateDto();
                leadProductAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
                leadProductAssociation.childSchemaId = productSchema.id;
                leadProductAssociation.isStatic = true;
                leadProductAssociation.parentActions = 'LOOKUP_AND_CREATE';
                leadProductAssociation.childActions = 'LOOKUP_ONLY';
                leadProductAssociation.cascadeDeleteChildRecord = false;
                leadProductAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
                leadProductAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
                leadProductAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
                leadProductAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

                try {
                    await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                        principal,
                        leadSchema.id,
                        leadProductAssociation,
                    );
                } catch (e) {
                    console.error(e);
                }

                initializeResults.push({
                    leadProductAssociation: 1,
                });

                //
                // Create an association Vendor -> Price Book
                //

                const vendorPriceBookAssociation = new SchemaAssociationCreateUpdateDto();
                vendorPriceBookAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
                vendorPriceBookAssociation.childSchemaId = priceBookSchema.id;
                vendorPriceBookAssociation.isStatic = true;
                vendorPriceBookAssociation.parentActions = 'LOOKUP_AND_CREATE';
                vendorPriceBookAssociation.childActions = 'LOOKUP_AND_CREATE';
                vendorPriceBookAssociation.cascadeDeleteChildRecord = false;
                vendorPriceBookAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
                vendorPriceBookAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
                vendorPriceBookAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
                vendorPriceBookAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

                try {
                    await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                        principal,
                        vendorSchema.id,
                        vendorPriceBookAssociation,
                    );
                } catch (e) {
                    console.error(e);
                }

                initializeResults.push({
                    vendorPriceBookAssociation: 1,
                });

                //
                // Create an association Price Book -> Product
                //

                const priceBookProductAssociation = new SchemaAssociationCreateUpdateDto();
                priceBookProductAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
                priceBookProductAssociation.childSchemaId = productSchema.id;
                priceBookProductAssociation.isStatic = true;
                priceBookProductAssociation.parentActions = 'LOOKUP_AND_CREATE';
                priceBookProductAssociation.childActions = 'READ_ONLY';
                priceBookProductAssociation.hasColumnMappings = true;
                priceBookProductAssociation.cascadeDeleteChildRecord = false;
                priceBookProductAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
                priceBookProductAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
                priceBookProductAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
                priceBookProductAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

                try {

                    await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                        principal,
                        priceBookSchema.id,
                        priceBookProductAssociation,
                    );

                } catch (e) {
                    console.error(e);
                }

                initializeResults.push({
                    priceBookProductAssociation: 1,
                });

                return resolve(initializeResults);

            } catch (e) {
                console.error(e);
                return reject(new ExceptionType(e.statusCode, e.message, e.validation));
            }

        });
    }
}
