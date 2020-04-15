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
import * as CUSTOMER_DEVICE_ONT from './devices/customer/types/devices.customer.ont.entity';
import * as CUSTOMER_DEVICE_ROUTER from './devices/customer/types/devices.customer.router.entity';
import * as NETWORK_DEVICE from './devices/network/types/devices.network.entity';
import * as SERVICE from './services/types/services.entity';

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

    public async initialize(principal: OrganizationUserEntity, headers): Promise<any> {
        try {

            let initializeResults = [];

            const addressSchema = await this.schemasService.getSchemaByOrganizationAndEntity(
                principal.organization,
                `${SchemaModuleTypeEnums.CRM_MODULE}:${SchemaModuleEntityTypeEnums.ADDRESS}`,
            );

            const productSchema = await this.schemasService.getSchemaByOrganizationAndEntity(
                principal.organization,
                `${SchemaModuleTypeEnums.PRODUCT_MODULE}:${SchemaModuleEntityTypeEnums.PRODUCT}`,
            );

            const orderItemSchema = await this.schemasService.getSchemaByOrganizationAndEntity(
                principal.organization,
                `${SchemaModuleTypeEnums.ORDER_MODULE}:${SchemaModuleEntityTypeEnums.ORDER_ITEM}`,
            );


            /**
             *  Create Network Device Schema
             */
            const networkDeviceSchemaCreate = new SchemaCreateUpdateDto();
            networkDeviceSchemaCreate.name = SchemaModuleEntityTypes.NETWORK_DEVICE.name;
            networkDeviceSchemaCreate.description = 'network device for the service module.';
            networkDeviceSchemaCreate.moduleName = SchemaModuleTypeEnums.SERVICE_MODULE;
            networkDeviceSchemaCreate.entityName = SchemaModuleEntityTypeEnums.NETWORK_DEVICE;
            networkDeviceSchemaCreate.recordNumber = 1;
            networkDeviceSchemaCreate.recordNumberPrefix = SchemaModuleEntityTypes.NETWORK_DEVICE.prefix;
            networkDeviceSchemaCreate.isSequential = true;
            networkDeviceSchemaCreate.isStatic = true;
            networkDeviceSchemaCreate.isHidden = false;
            networkDeviceSchemaCreate.hasTitle = true;
            networkDeviceSchemaCreate.position = 0;
            networkDeviceSchemaCreate.searchUrl = dbRecordUrlConstants.searchUrl;
            networkDeviceSchemaCreate.getUrl = dbRecordUrlConstants.getUrl;
            networkDeviceSchemaCreate.postUrl = dbRecordUrlConstants.postUrl;
            networkDeviceSchemaCreate.putUrl = dbRecordUrlConstants.putUrl;
            networkDeviceSchemaCreate.deleteUrl = dbRecordUrlConstants.deleteUrl;

            const networkDeviceSchema = await this.schemasService.createSchemaByPrincipal(
                principal,
                networkDeviceSchemaCreate,
                { upsert: true },
            );
            const networkDeviceColumns = await this.schemasColumnsService.updateOrCreateByPrincipal(
                principal,
                networkDeviceSchema.id,
                NETWORK_DEVICE.columns,
            );
            initializeResults.push({
                networkDeviceColumns,
            });

            /**
             *  Create Customer Device Router Schema
             */
            const customerDeviceRouterSchemaCreate = new SchemaCreateUpdateDto();
            customerDeviceRouterSchemaCreate.name = SchemaModuleEntityTypes.CUSTOMER_DEVICE_ROUTER.name;
            customerDeviceRouterSchemaCreate.description = 'customer device (router) for the service module.';
            customerDeviceRouterSchemaCreate.moduleName = SchemaModuleTypeEnums.SERVICE_MODULE;
            customerDeviceRouterSchemaCreate.entityName = SchemaModuleEntityTypeEnums.CUSTOMER_DEVICE_ROUTER;
            customerDeviceRouterSchemaCreate.recordNumber = 1;
            customerDeviceRouterSchemaCreate.recordNumberPrefix = SchemaModuleEntityTypes.CUSTOMER_DEVICE_ROUTER.prefix;
            customerDeviceRouterSchemaCreate.isSequential = true;
            customerDeviceRouterSchemaCreate.isStatic = true;
            customerDeviceRouterSchemaCreate.isHidden = false;
            customerDeviceRouterSchemaCreate.hasTitle = false;
            customerDeviceRouterSchemaCreate.position = 0;
            customerDeviceRouterSchemaCreate.searchUrl = dbRecordUrlConstants.searchUrl;
            customerDeviceRouterSchemaCreate.getUrl = dbRecordUrlConstants.getUrl;
            customerDeviceRouterSchemaCreate.postUrl = dbRecordUrlConstants.postUrl;
            customerDeviceRouterSchemaCreate.putUrl = dbRecordUrlConstants.putUrl;
            customerDeviceRouterSchemaCreate.deleteUrl = dbRecordUrlConstants.deleteUrl;

            const customerDeviceRouterSchema = await this.schemasService.createSchemaByPrincipal(
                principal,
                customerDeviceRouterSchemaCreate,
                { upsert: true },
            );
            const customerDeviceRouterColumns = await this.schemasColumnsService.updateOrCreateByPrincipal(
                principal,
                customerDeviceRouterSchema.id,
                CUSTOMER_DEVICE_ROUTER.columns,
            );
            initializeResults.push({
                customerDeviceRouterColumns,
            });

            /**
             *  Create Customer Device Router Schema
             */
            const customerDeviceOntSchemaCreate = new SchemaCreateUpdateDto();
            customerDeviceOntSchemaCreate.name = SchemaModuleEntityTypes.CUSTOMER_DEVICE_ONT.name;
            customerDeviceOntSchemaCreate.description = 'customer device (ONT) for the service module.';
            customerDeviceOntSchemaCreate.moduleName = SchemaModuleTypeEnums.SERVICE_MODULE;
            customerDeviceOntSchemaCreate.entityName = SchemaModuleEntityTypeEnums.CUSTOMER_DEVICE_ONT;
            customerDeviceOntSchemaCreate.recordNumber = 1;
            customerDeviceOntSchemaCreate.recordNumberPrefix = SchemaModuleEntityTypeEnums.CUSTOMER_DEVICE_ONT;
            customerDeviceOntSchemaCreate.isSequential = true;
            customerDeviceOntSchemaCreate.isStatic = true;
            customerDeviceOntSchemaCreate.isHidden = false;
            customerDeviceOntSchemaCreate.hasTitle = false;
            customerDeviceOntSchemaCreate.position = 0;
            customerDeviceOntSchemaCreate.searchUrl = dbRecordUrlConstants.searchUrl;
            customerDeviceOntSchemaCreate.getUrl = dbRecordUrlConstants.getUrl;
            customerDeviceOntSchemaCreate.postUrl = dbRecordUrlConstants.postUrl;
            customerDeviceOntSchemaCreate.putUrl = dbRecordUrlConstants.putUrl;
            customerDeviceOntSchemaCreate.deleteUrl = dbRecordUrlConstants.deleteUrl;

            const customerDeviceOntSchema = await this.schemasService.createSchemaByPrincipal(
                principal,
                customerDeviceOntSchemaCreate,
                { upsert: true },
            );
            const customerDeviceOntColumns = await this.schemasColumnsService.updateOrCreateByPrincipal(
                principal,
                customerDeviceOntSchema.id,
                CUSTOMER_DEVICE_ONT.columns,
            );
            initializeResults.push({
                customerDeviceOntColumns,
            });

            /**
             *  Create Service Schema
             */
            const serviceSchemaCreate = new SchemaCreateUpdateDto();
            serviceSchemaCreate.name = SchemaModuleEntityTypes.SERVICE.name;
            serviceSchemaCreate.description = 'service for the service module.';
            serviceSchemaCreate.moduleName = SchemaModuleTypeEnums.SERVICE_MODULE;
            serviceSchemaCreate.entityName = SchemaModuleEntityTypeEnums.SERVICE;
            serviceSchemaCreate.recordNumber = 1;
            serviceSchemaCreate.recordNumberPrefix = SchemaModuleEntityTypes.SERVICE.prefix;
            serviceSchemaCreate.isSequential = true;
            serviceSchemaCreate.isStatic = true;
            serviceSchemaCreate.isHidden = false;
            serviceSchemaCreate.hasTitle = true;
            serviceSchemaCreate.isTitleUnique = true;
            serviceSchemaCreate.position = 0;
            serviceSchemaCreate.searchUrl = dbRecordUrlConstants.searchUrl;
            serviceSchemaCreate.getUrl = dbRecordUrlConstants.getUrl;
            serviceSchemaCreate.postUrl = dbRecordUrlConstants.postUrl;
            serviceSchemaCreate.putUrl = dbRecordUrlConstants.putUrl;
            serviceSchemaCreate.deleteUrl = dbRecordUrlConstants.deleteUrl;

            const serviceSchema = await this.schemasService.createSchemaByPrincipal(
                principal,
                serviceSchemaCreate,
                { upsert: true },
            );
            const serviceColumns = await this.schemasColumnsService.updateOrCreateByPrincipal(
                principal,
                serviceSchema.id,
                SERVICE.columns,
            );
            initializeResults.push({
                serviceColumns,
            });


            //
            // Create an association Network Device ->  Customer Device ONT
            //
            const nwdCdOntAssociation = new SchemaAssociationCreateUpdateDto();
            nwdCdOntAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
            nwdCdOntAssociation.childSchemaId = customerDeviceOntSchema.id;
            nwdCdOntAssociation.isStatic = true;
            nwdCdOntAssociation.parentActions = 'CREATE_ONLY';
            nwdCdOntAssociation.childActions = 'CREATE_ONLY';
            nwdCdOntAssociation.cascadeDeleteChildRecord = false;
            nwdCdOntAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
            nwdCdOntAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
            nwdCdOntAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
            nwdCdOntAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

            try {
                await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                    principal,
                    networkDeviceSchema.id,
                    nwdCdOntAssociation,
                );
                initializeResults.push({
                    nwdCdOntAssociation: 1,
                });
            } catch (e) {
                console.error(e);
            }


            //
            // Create an association Customer Device ONT ->  Customer Device Router
            //
            const CdOntCdRouterAssociation = new SchemaAssociationCreateUpdateDto();
            CdOntCdRouterAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
            CdOntCdRouterAssociation.childSchemaId = customerDeviceRouterSchema.id;
            CdOntCdRouterAssociation.isStatic = true;
            CdOntCdRouterAssociation.parentActions = 'CREATE_ONLY';
            CdOntCdRouterAssociation.childActions = 'CREATE_ONLY';
            CdOntCdRouterAssociation.cascadeDeleteChildRecord = false;
            CdOntCdRouterAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
            CdOntCdRouterAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
            CdOntCdRouterAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
            CdOntCdRouterAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

            try {
                await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                    principal,
                    customerDeviceOntSchema.id,
                    CdOntCdRouterAssociation,
                );
                initializeResults.push({
                    CdOntCdRouterAssociation: 1,
                });
            } catch (e) {
                console.error(e);
            }

            //
            // Create an association Customer Device Router -> Service
            //
            const CdRouterServiceAssociation = new SchemaAssociationCreateUpdateDto();
            CdRouterServiceAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_ONE;
            CdRouterServiceAssociation.childSchemaId = serviceSchema.id;
            CdRouterServiceAssociation.isStatic = true;
            CdRouterServiceAssociation.parentActions = 'CREATE_ONLY';
            CdRouterServiceAssociation.childActions = 'CREATE_ONLY';
            CdRouterServiceAssociation.cascadeDeleteChildRecord = false;
            CdRouterServiceAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
            CdRouterServiceAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
            CdRouterServiceAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
            CdRouterServiceAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

            try {
                await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                    principal,
                    customerDeviceRouterSchema.id,
                    CdRouterServiceAssociation,
                );
                initializeResults.push({
                    CdRouterServiceAssociation: 1,
                });
            } catch (e) {
                console.error(e);
            }

            //
            // Create an association Product -> Service
            //
            const ProductServiceAssociation = new SchemaAssociationCreateUpdateDto();
            ProductServiceAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_ONE;
            ProductServiceAssociation.childSchemaId = serviceSchema.id;
            ProductServiceAssociation.isStatic = true;
            ProductServiceAssociation.parentActions = 'CREATE_ONLY';
            ProductServiceAssociation.childActions = 'CREATE_ONLY';
            ProductServiceAssociation.cascadeDeleteChildRecord = false;
            ProductServiceAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
            ProductServiceAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
            ProductServiceAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
            ProductServiceAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

            try {
                await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                    principal,
                    productSchema.id,
                    ProductServiceAssociation,
                );
                initializeResults.push({
                    ProductServiceAssociation: 1,
                });
            } catch (e) {
                console.error(e);
            }

            //
            // Create an association Address -> Customer Device ONT
            //
            const AddressCustomerDeviceOntAssociation = new SchemaAssociationCreateUpdateDto();
            AddressCustomerDeviceOntAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
            AddressCustomerDeviceOntAssociation.childSchemaId = customerDeviceOntSchema.id;
            AddressCustomerDeviceOntAssociation.isStatic = true;
            AddressCustomerDeviceOntAssociation.parentActions = 'CREATE_ONLY';
            AddressCustomerDeviceOntAssociation.childActions = 'CREATE_ONLY';
            AddressCustomerDeviceOntAssociation.cascadeDeleteChildRecord = false;
            AddressCustomerDeviceOntAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
            AddressCustomerDeviceOntAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
            AddressCustomerDeviceOntAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
            AddressCustomerDeviceOntAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

            try {
                await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                    principal,
                    addressSchema.id,
                    AddressCustomerDeviceOntAssociation,
                );
                initializeResults.push({
                    AddressCustomerDeviceOntAssociation: 1,
                });
            } catch (e) {
                console.error(e);
            }

            //
            // Create an association Order Item -> Customer Device ONT
            //
            const OrderItemCustomerDeviceOntAssociation = new SchemaAssociationCreateUpdateDto();
            OrderItemCustomerDeviceOntAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_ONE;
            OrderItemCustomerDeviceOntAssociation.childSchemaId = customerDeviceOntSchema.id;
            OrderItemCustomerDeviceOntAssociation.isStatic = true;
            OrderItemCustomerDeviceOntAssociation.parentActions = 'CREATE_ONLY';
            OrderItemCustomerDeviceOntAssociation.childActions = 'CREATE_ONLY';
            OrderItemCustomerDeviceOntAssociation.cascadeDeleteChildRecord = false;
            OrderItemCustomerDeviceOntAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
            OrderItemCustomerDeviceOntAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
            OrderItemCustomerDeviceOntAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
            OrderItemCustomerDeviceOntAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

            try {
                await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                    principal,
                    orderItemSchema.id,
                    OrderItemCustomerDeviceOntAssociation,
                );
                initializeResults.push({
                    OrderItemCustomerDeviceOntAssociation: 1,
                });
            } catch (e) {
                console.error(e);
            }

            //
            // Create an association Order Item -> Customer Device Router
            //
            const OrderItemCustomerDeviceRouterAssociation = new SchemaAssociationCreateUpdateDto();
            OrderItemCustomerDeviceRouterAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
            OrderItemCustomerDeviceRouterAssociation.childSchemaId = customerDeviceRouterSchema.id;
            OrderItemCustomerDeviceRouterAssociation.isStatic = true;
            OrderItemCustomerDeviceRouterAssociation.parentActions = 'CREATE_ONLY';
            OrderItemCustomerDeviceRouterAssociation.childActions = 'CREATE_ONLY';
            OrderItemCustomerDeviceRouterAssociation.cascadeDeleteChildRecord = false;
            OrderItemCustomerDeviceRouterAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
            OrderItemCustomerDeviceRouterAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
            OrderItemCustomerDeviceRouterAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
            OrderItemCustomerDeviceRouterAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

            try {
                await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                    principal,
                    orderItemSchema.id,
                    OrderItemCustomerDeviceRouterAssociation,
                );
                initializeResults.push({
                    OrderItemCustomerDeviceRouterAssociation: 1,
                });
            } catch (e) {
                console.error(e);
            }

            return initializeResults;
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }

    }
}
