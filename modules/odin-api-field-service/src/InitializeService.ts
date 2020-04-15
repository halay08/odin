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
import { PipelineEntitysService } from '@d19n/schema-manager/dist/pipelines/pipelines.service';
import { PipelineEntitysStagesService } from '@d19n/schema-manager/dist/pipelines/stages/pipelines.stages.service';
import { SchemasAssociationsService } from '@d19n/schema-manager/dist/schemas/associations/schemas.associations.service';
import { SchemasColumnsService } from '@d19n/schema-manager/dist/schemas/columns/schemas.columns.service';
import { SchemasService } from '@d19n/schema-manager/dist/schemas/schemas.service';
import { dbRecordAssociationUrlConstants, dbRecordUrlConstants } from '@d19n/schema-manager/dist/schemas/url.constants'
import { Injectable } from '@nestjs/common';

import * as dotenv from 'dotenv';
import * as SERVICE_APPOINTMENT from './service-appointment/service.appointments.entity';
import * as WORK_ORDER from './work-orders/work.order.entity';

dotenv.config();

@Injectable()
export class InitializeService {

    private schemasService: SchemasService;
    private pipelineEntitysService: PipelineEntitysService;
    private pipelineEntitysStagesService: PipelineEntitysStagesService;
    private schemasColumnsService: SchemasColumnsService;
    private schemasAssociationsService: SchemasAssociationsService;

    constructor(
        schemasService: SchemasService,
        schemasColumnsService: SchemasColumnsService,
        schemasAssociationsService: SchemasAssociationsService,
        pipelineEntitysService: PipelineEntitysService,
        pipelineEntitysStagesService: PipelineEntitysStagesService,
    ) {
        this.schemasService = schemasService;
        this.schemasColumnsService = schemasColumnsService;
        this.schemasAssociationsService = schemasAssociationsService;
        this.pipelineEntitysService = pipelineEntitysService;
        this.pipelineEntitysStagesService = pipelineEntitysStagesService;
    }


    public initialize(principal: OrganizationUserEntity, headers): Promise<any> {
        return new Promise(async (resolve, reject) => {

                try {
                    let initializeResults = [];

                    const accountSchema = await this.schemasService.getSchemaByOrganizationAndEntity(
                        principal.organization,
                        `${SchemaModuleTypeEnums.CRM_MODULE}:${SchemaModuleEntityTypeEnums.ACCOUNT}`,
                    );

                    const contactSchema = await this.schemasService.getSchemaByOrganizationAndEntity(
                        principal.organization,
                        `${SchemaModuleTypeEnums.CRM_MODULE}:${SchemaModuleEntityTypeEnums.CONTACT}`,
                    );

                    const addressSchema = await this.schemasService.getSchemaByOrganizationAndEntity(
                        principal.organization,
                        `${SchemaModuleTypeEnums.CRM_MODULE}:${SchemaModuleEntityTypeEnums.ADDRESS}`,
                    );

                    const orderItemSchema = await this.schemasService.getSchemaByOrganizationAndEntity(
                        principal.organization,
                        `${SchemaModuleTypeEnums.ORDER_MODULE}:${SchemaModuleEntityTypeEnums.ORDER_ITEM}`,
                    );

                    const noteSchema = await this.schemasService.getSchemaByOrganizationAndEntity(
                        principal.organization,
                        `${SchemaModuleTypeEnums.SUPPORT_MODULE}:Note`,
                    );


                    /**
                     *  Create Work Order Schema
                     */
                    const workOrderSchemaCreate = new SchemaCreateUpdateDto();

                    workOrderSchemaCreate.name = SchemaModuleEntityTypes.WORK_ORDER.name;
                    workOrderSchemaCreate.description = 'work orders for the field service module.';
                    workOrderSchemaCreate.moduleName = SchemaModuleTypeEnums.FIELD_SERVICE_MODULE;
                    workOrderSchemaCreate.entityName = SchemaModuleEntityTypes.WORK_ORDER.label;
                    workOrderSchemaCreate.recordNumber = 1;
                    workOrderSchemaCreate.recordNumberPrefix = SchemaModuleEntityTypes.WORK_ORDER.prefix;
                    workOrderSchemaCreate.isSequential = true;
                    workOrderSchemaCreate.isStatic = true;
                    workOrderSchemaCreate.isHidden = false;
                    workOrderSchemaCreate.hasTitle = true;
                    workOrderSchemaCreate.position = 0;
                    workOrderSchemaCreate.searchUrl = dbRecordUrlConstants.searchUrl;
                    workOrderSchemaCreate.getUrl = dbRecordUrlConstants.getUrl;
                    workOrderSchemaCreate.postUrl = dbRecordUrlConstants.postUrl;
                    workOrderSchemaCreate.putUrl = dbRecordUrlConstants.putUrl;
                    workOrderSchemaCreate.deleteUrl = dbRecordUrlConstants.deleteUrl;

                    const workOrderSchema = await this.schemasService.createSchemaByPrincipal(
                        principal,
                        workOrderSchemaCreate,
                        { upsert: true },
                    );
                    const workOrderColumns = await this.schemasColumnsService.updateOrCreateByPrincipal(
                        principal,
                        workOrderSchema.id,
                        WORK_ORDER.columns,
                    );
                    initializeResults.push({
                        workOrderColumns,
                    });

                    /**
                     *  Create Service Appointment Schema
                     */
                    const serviceAppointmentSchemaCreate = new SchemaCreateUpdateDto();

                    serviceAppointmentSchemaCreate.name = SchemaModuleEntityTypes.SERVICE_APPOINTMENT.name;
                    serviceAppointmentSchemaCreate.description = 'service appointment for the field service module.';
                    serviceAppointmentSchemaCreate.moduleName = SchemaModuleTypeEnums.FIELD_SERVICE_MODULE;
                    serviceAppointmentSchemaCreate.entityName = SchemaModuleEntityTypes.SERVICE_APPOINTMENT.label;
                    serviceAppointmentSchemaCreate.recordNumber = 1;
                    serviceAppointmentSchemaCreate.recordNumberPrefix = SchemaModuleEntityTypes.SERVICE_APPOINTMENT.prefix;
                    serviceAppointmentSchemaCreate.isSequential = true;
                    serviceAppointmentSchemaCreate.isStatic = true;
                    serviceAppointmentSchemaCreate.isHidden = false;
                    serviceAppointmentSchemaCreate.hasTitle = true;
                    serviceAppointmentSchemaCreate.position = 0;
                    serviceAppointmentSchemaCreate.searchUrl = dbRecordUrlConstants.searchUrl;
                    serviceAppointmentSchemaCreate.getUrl = dbRecordUrlConstants.getUrl;
                    serviceAppointmentSchemaCreate.postUrl = dbRecordUrlConstants.postUrl;
                    serviceAppointmentSchemaCreate.putUrl = dbRecordUrlConstants.putUrl;
                    serviceAppointmentSchemaCreate.deleteUrl = dbRecordUrlConstants.deleteUrl;

                    const serviceAppointmentSchema = await this.schemasService.createSchemaByPrincipal(
                        principal,
                        serviceAppointmentSchemaCreate,
                        { upsert: true },
                    );
                    const serviceAppointmentColumns = await this.schemasColumnsService.updateOrCreateByPrincipal(
                        principal,
                        serviceAppointmentSchema.id,
                        SERVICE_APPOINTMENT.columns,
                    );
                    initializeResults.push({
                        serviceAppointmentColumns,
                    });


                    //
                    // Create an association Work Order -> Service Appointment
                    //
                    const workOrderServiceAppointmentAssociation = new SchemaAssociationCreateUpdateDto();
                    workOrderServiceAppointmentAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
                    workOrderServiceAppointmentAssociation.childSchemaId = serviceAppointmentSchema.id;
                    workOrderServiceAppointmentAssociation.parentActions = 'LOOKUP_AND_CREATE';
                    workOrderServiceAppointmentAssociation.parentActions = 'LOOKUP_AND_CREATE';
                    workOrderServiceAppointmentAssociation.cascadeDeleteChildRecord = false;
                    workOrderServiceAppointmentAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
                    workOrderServiceAppointmentAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
                    workOrderServiceAppointmentAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
                    workOrderServiceAppointmentAssociation.deleteUrl = `${process.env.MODULE_NAME}/v1.0/ServiceAppointment/db-associations/{dbRecordAssociationId}`;

                    try {
                        await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                            principal,
                            workOrderSchema.id,
                            workOrderServiceAppointmentAssociation,
                        );
                        initializeResults.push({
                            workOrderServiceAppointmentAssociation: 1,
                        });
                    } catch (e) {
                        console.error(e);
                    }

                    //
                    // Create an association Account -> Work Order
                    //

                    const accountWorkOrderAssociation = new SchemaAssociationCreateUpdateDto();
                    accountWorkOrderAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
                    accountWorkOrderAssociation.childSchemaId = workOrderSchema.id;
                    accountWorkOrderAssociation.parentActions = 'LOOKUP_AND_CREATE';
                    accountWorkOrderAssociation.cascadeDeleteChildRecord = false;
                    accountWorkOrderAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
                    accountWorkOrderAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
                    accountWorkOrderAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
                    accountWorkOrderAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

                    try {
                        await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                            principal,
                            accountSchema.id,
                            accountWorkOrderAssociation,
                        );
                        initializeResults.push({
                            accountWorkOrderAssociation: 1,
                        });
                    } catch (e) {
                        console.error(e);
                    }

                    //
                    // Create an association Order -> Contact
                    //
                    const workOrderContactAssociation = new SchemaAssociationCreateUpdateDto();
                    workOrderContactAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_ONE;
                    workOrderContactAssociation.childSchemaId = contactSchema.id;
                    workOrderContactAssociation.isStatic = true;
                    workOrderContactAssociation.parentActions = 'CREATE_ONLY';
                    workOrderContactAssociation.childActions = 'CREATE_ONLY';
                    workOrderContactAssociation.cascadeDeleteChildRecord = true;
                    workOrderContactAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
                    workOrderContactAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
                    workOrderContactAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
                    workOrderContactAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

                    try {
                        await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                            principal,
                            workOrderSchema.id,
                            workOrderContactAssociation,
                        );
                        initializeResults.push({
                            workOrderContactAssociation: 1,
                        });
                    } catch (e) {
                        console.error(e);
                    }

                    //
                    // Create an association Order ->Address
                    //
                    const workOrderAddressAssociation = new SchemaAssociationCreateUpdateDto();
                    workOrderAddressAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_ONE;
                    workOrderAddressAssociation.childSchemaId = addressSchema.id;
                    workOrderAddressAssociation.isStatic = true;
                    workOrderAddressAssociation.parentActions = 'CREATE_ONLY';
                    workOrderAddressAssociation.childActions = 'CREATE_ONLY';
                    workOrderAddressAssociation.cascadeDeleteChildRecord = true;
                    workOrderAddressAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
                    workOrderAddressAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
                    workOrderAddressAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
                    workOrderAddressAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

                    try {
                        await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                            principal,
                            workOrderSchema.id,
                            workOrderAddressAssociation,
                        );
                        initializeResults.push({
                            workOrderAddressAssociation: 1,
                        });
                    } catch (e) {
                        console.error(e);
                    }


                    //
                    // Create an association Work Order -> Order Item
                    //
                    const workOrderOrderItemAssociation = new SchemaAssociationCreateUpdateDto();
                    workOrderOrderItemAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
                    workOrderOrderItemAssociation.childSchemaId = orderItemSchema.id;
                    workOrderOrderItemAssociation.parentActions = 'LOOKUP_AND_CREATE';
                    workOrderOrderItemAssociation.cascadeDeleteChildRecord = false;
                    workOrderOrderItemAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
                    workOrderOrderItemAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
                    workOrderOrderItemAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
                    workOrderOrderItemAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

                    try {
                        await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                            principal,
                            workOrderSchema.id,
                            workOrderOrderItemAssociation,
                        );
                        initializeResults.push({
                            workOrderOrderItemAssociation: 1,
                        });
                    } catch (e) {
                        console.error(e);
                    }

                    //
                    // Create an association WorkOrder -> Note
                    //
                    const workOrderNoteAssociation = new SchemaAssociationCreateUpdateDto();
                    workOrderNoteAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
                    workOrderNoteAssociation.childSchemaId = noteSchema.id;
                    workOrderNoteAssociation.parentActions = 'CREATE_ONLY';
                    workOrderNoteAssociation.childActions = 'READ_ONLY';
                    workOrderNoteAssociation.cascadeDeleteChildRecord = true;
                    workOrderNoteAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
                    workOrderNoteAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
                    workOrderNoteAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
                    workOrderNoteAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

                    try {
                        await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                            principal,
                            workOrderSchema.id,
                            workOrderNoteAssociation,
                        );
                        initializeResults.push({
                            workOrderNoteAssociation: 1,
                        });
                    } catch (e) {
                        console.error(e);
                    }

                    return resolve(initializeResults);

                } catch (e) {
                    console.error(e);
                    return reject(new ExceptionType(e.statusCode, e.message, e.validation));
                }
            },
        );
    }

}
