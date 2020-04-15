import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { PipelineCreateUpdateDto } from '@d19n/models/dist/schema-manager/pipeline/dto/pipeline.create.update.dto';
import { PipelineStageCreateUpdateDto } from '@d19n/models/dist/schema-manager/pipeline/stage/dto/pipeline.stage.create.update.dto';
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
import { dbRecordAssociationUrlConstants, dbRecordUrlConstants } from '@d19n/schema-manager/dist/schemas/url.constants';
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as ACCOUNT from './accounts/account.entity';
import * as ADDRESS from './addresses/types/address.entity';
import * as CONTACT from './contacts/contact.entity';
import * as CONTACT_IDENTITY from './contacts/identities/types/contact.identity.entity';
import * as LEAD from './leads/lead.entity';
import * as ORGANIZATION from './organizations/organization.entity';
import * as PREMISE from './premise/premise.entity';
import * as VISIT from './visit/visit.entity';

dotenv.config();

@Injectable()
export class InitializeService {

    private schemasService: SchemasService;
    private schemasColumnsService: SchemasColumnsService;
    private schemasAssociationsService: SchemasAssociationsService;
    private pipelineEntitysService: PipelineEntitysService;
    private pipelineEntitysStagesService: PipelineEntitysStagesService

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

    public async initialize(principal: OrganizationUserEntity, headers): Promise<any> {

        const noteSchema = await this.schemasService.getSchemaByOrganizationAndEntity(
            principal.organization,
            `${SchemaModuleTypeEnums.SUPPORT_MODULE}:Note`,
        );


        try {

            let initializeResults = [];

            /**
             *  Create Premise Schema
             */
            const premisesSchemaCreate = new SchemaCreateUpdateDto();
            premisesSchemaCreate.name = 'premise';
            premisesSchemaCreate.description = 'premises for the CRM module.';
            premisesSchemaCreate.moduleName = SchemaModuleTypeEnums.CRM_MODULE;
            premisesSchemaCreate.entityName = 'Premise';
            premisesSchemaCreate.recordNumber = 1;
            premisesSchemaCreate.isSequential = false;
            premisesSchemaCreate.isStatic = true;
            premisesSchemaCreate.isHidden = false;
            premisesSchemaCreate.hasTitle = true;
            premisesSchemaCreate.isTitleUnique = true;
            premisesSchemaCreate.position = 2;
            premisesSchemaCreate.searchUrl = dbRecordUrlConstants.searchUrl;
            premisesSchemaCreate.getUrl = dbRecordUrlConstants.getUrl;
            premisesSchemaCreate.postUrl = dbRecordUrlConstants.postUrl;
            premisesSchemaCreate.putUrl = dbRecordUrlConstants.putUrl;
            premisesSchemaCreate.deleteUrl = dbRecordUrlConstants.deleteUrl;

            const premiseSchema = await this.schemasService.createSchemaByPrincipal(
                principal,
                premisesSchemaCreate,
                { upsert: true },
            );
            console.log('premiseSchema', premiseSchema);
            const premiseColumns = await this.schemasColumnsService.updateOrCreateByPrincipal(
                principal,
                premiseSchema.id,
                PREMISE.columns,
            );
            initializeResults.push({
                premiseColumns,
            });


            /**
             *  Create Account Schema
             */
            const accountsSchemaCreate = new SchemaCreateUpdateDto();
            accountsSchemaCreate.name = SchemaModuleEntityTypes.ACCOUNT.name;
            accountsSchemaCreate.description = 'accounts for the CRM module.';
            accountsSchemaCreate.moduleName = SchemaModuleTypeEnums.CRM_MODULE;
            accountsSchemaCreate.entityName = SchemaModuleEntityTypes.ACCOUNT.label;
            accountsSchemaCreate.recordNumber = 1;
            accountsSchemaCreate.recordNumberPrefix = SchemaModuleEntityTypes.ACCOUNT.prefix;
            accountsSchemaCreate.isSequential = true;
            accountsSchemaCreate.isStatic = true;
            accountsSchemaCreate.isHidden = false;
            accountsSchemaCreate.hasTitle = true;
            premisesSchemaCreate.isTitleUnique = true;
            accountsSchemaCreate.position = 2;
            accountsSchemaCreate.searchUrl = dbRecordUrlConstants.searchUrl;
            accountsSchemaCreate.getUrl = dbRecordUrlConstants.getUrl;
            accountsSchemaCreate.postUrl = dbRecordUrlConstants.postUrl;
            accountsSchemaCreate.putUrl = dbRecordUrlConstants.putUrl;
            accountsSchemaCreate.deleteUrl = dbRecordUrlConstants.deleteUrl;

            const accountSchema = await this.schemasService.createSchemaByPrincipal(
                principal,
                accountsSchemaCreate,
                { upsert: true },
            );
            console.log('accountSchema', accountSchema);
            const accountColumns = await this.schemasColumnsService.updateOrCreateByPrincipal(
                principal,
                accountSchema.id,
                ACCOUNT.columns,
            );
            initializeResults.push({
                accountColumns,
            });

            /**
             * Create Account Pipeline
             * Create Account Pipeline Stages
             */
            const accountPipelineCreate = new PipelineCreateUpdateDto();

            accountPipelineCreate.name = 'Account Pipeline';
            accountPipelineCreate.key = 'AccountPipeline';
            accountPipelineCreate.description = 'pipeline for accounts';
            accountPipelineCreate.moduleName = SchemaModuleTypeEnums.CRM_MODULE;
            accountPipelineCreate.entityName = SchemaModuleEntityTypeEnums.ACCOUNT;
            accountPipelineCreate.isDefault = true;

            const accountPipeline = await this.pipelineEntitysService.createByPrincipal(
                principal,
                accountPipelineCreate,
            );

            const accountStageNewCreate = new PipelineStageCreateUpdateDto();
            accountStageNewCreate.name = 'New';
            accountStageNewCreate.key = 'AccountStageNew';
            accountStageNewCreate.description = 'account new stage';
            accountStageNewCreate.isDefault = true;

            await this.pipelineEntitysStagesService.updateOrCreateStage(
                principal,
                accountPipeline.id,
                accountStageNewCreate,
            );

            const accountStageActiveCreate = new PipelineStageCreateUpdateDto();
            accountStageActiveCreate.name = 'Active';
            accountStageActiveCreate.key = 'AccountStageActive';
            accountStageActiveCreate.description = 'account active stage';

            await this.pipelineEntitysStagesService.updateOrCreateStage(
                principal,
                accountPipeline.id,
                accountStageActiveCreate,
            );

            const accountStageInactiveCreate = new PipelineStageCreateUpdateDto();
            accountStageInactiveCreate.name = 'Inactive';
            accountStageInactiveCreate.key = 'AccountStageInactive';
            accountStageInactiveCreate.description = 'account inactive stage';

            await this.pipelineEntitysStagesService.updateOrCreateStage(
                principal,
                accountPipeline.id,
                accountStageInactiveCreate,
            );


            /**
             *  Create Lead Schema
             */
            const leadsSchemaCreate = new SchemaCreateUpdateDto();
            leadsSchemaCreate.name = SchemaModuleEntityTypes.LEAD.name;
            leadsSchemaCreate.description = 'leads for the CRM module.';
            leadsSchemaCreate.moduleName = SchemaModuleTypeEnums.CRM_MODULE;
            leadsSchemaCreate.entityName = SchemaModuleEntityTypes.LEAD.label;
            leadsSchemaCreate.recordNumber = 1;
            leadsSchemaCreate.recordNumberPrefix = SchemaModuleEntityTypes.LEAD.prefix;
            leadsSchemaCreate.isSequential = true;
            leadsSchemaCreate.isStatic = true;
            leadsSchemaCreate.isHidden = false;
            leadsSchemaCreate.hasTitle = true;
            premisesSchemaCreate.isTitleUnique = true;
            leadsSchemaCreate.position = 1;
            leadsSchemaCreate.searchUrl = dbRecordUrlConstants.searchUrl;
            leadsSchemaCreate.getUrl = dbRecordUrlConstants.getUrl;
            leadsSchemaCreate.postUrl = dbRecordUrlConstants.postUrl;
            leadsSchemaCreate.putUrl = dbRecordUrlConstants.putUrl;
            leadsSchemaCreate.deleteUrl = dbRecordUrlConstants.deleteUrl;

            const leadSchema = await this.schemasService.createSchemaByPrincipal(
                principal,
                leadsSchemaCreate, { upsert: true },
            );
            const leadColumns = await this.schemasColumnsService.updateOrCreateByPrincipal(
                principal,
                leadSchema.id,
                LEAD.columns,
            );
            initializeResults.push({
                leadColumns,
            });

            /**
             * Create Lead Pipeline
             * Create Lead Pipeline Stages
             */
            const leadPipelineCreate = new PipelineCreateUpdateDto();

            leadPipelineCreate.name = 'Lead Pipeline';
            leadPipelineCreate.key = 'LeadPipeline';
            leadPipelineCreate.description = 'pipeline for leads';
            leadPipelineCreate.moduleName = SchemaModuleTypeEnums.CRM_MODULE;
            leadPipelineCreate.entityName = SchemaModuleEntityTypeEnums.LEAD;
            leadPipelineCreate.isDefault = true;

            const leadPipeline = await this.pipelineEntitysService.createByPrincipal(
                principal,
                leadPipelineCreate,
            );

            const leadStageProspectingCreate = new PipelineStageCreateUpdateDto();
            leadStageProspectingCreate.name = 'Prospecting';
            leadStageProspectingCreate.key = 'LeadStageProspecting';
            leadStageProspectingCreate.description = 'lead prospecting stage';
            leadStageProspectingCreate.isDefault = true;

            await this.pipelineEntitysStagesService.updateOrCreateStage(
                principal,
                leadPipeline.id,
                leadStageProspectingCreate,
            );

            const leadStageContactedCreate = new PipelineStageCreateUpdateDto();
            leadStageContactedCreate.name = 'Contacted';
            leadStageContactedCreate.key = 'LeadStageContacted';
            leadStageContactedCreate.description = 'lead contacted stage';

            await this.pipelineEntitysStagesService.updateOrCreateStage(
                principal,
                leadPipeline.id,
                leadStageContactedCreate,
            );

            const leadStageQualifiedCreate = new PipelineStageCreateUpdateDto();
            leadStageQualifiedCreate.name = 'Qualified';
            leadStageQualifiedCreate.key = 'LeadStageQualified';
            leadStageQualifiedCreate.description = 'lead qualified stage';

            await this.pipelineEntitysStagesService.updateOrCreateStage(
                principal,
                leadPipeline.id,
                leadStageQualifiedCreate,
            );

            const leadStageWonCreate = new PipelineStageCreateUpdateDto();
            leadStageWonCreate.name = 'Won';
            leadStageWonCreate.key = 'LeadStageWon';
            leadStageWonCreate.description = 'lead won stage';

            await this.pipelineEntitysStagesService.updateOrCreateStage(
                principal,
                leadPipeline.id,
                leadStageWonCreate,
            );

            const leadStageLostCreate = new PipelineStageCreateUpdateDto();
            leadStageLostCreate.name = 'Lost';
            leadStageLostCreate.key = 'LeadStageLost';
            leadStageLostCreate.description = 'lead lost stage';

            await this.pipelineEntitysStagesService.updateOrCreateStage(
                principal,
                leadPipeline.id,
                leadStageLostCreate,
            );


            /**
             *  Create Contact Schema
             */
            const contactsSchemaCreate = new SchemaCreateUpdateDto();

            contactsSchemaCreate.name = SchemaModuleEntityTypes.CONTACT.name;
            contactsSchemaCreate.description = 'contacts for the CRM module.';
            contactsSchemaCreate.moduleName = SchemaModuleTypeEnums.CRM_MODULE;
            contactsSchemaCreate.entityName = SchemaModuleEntityTypes.CONTACT.label;
            contactsSchemaCreate.isSequential = false;
            contactsSchemaCreate.isStatic = true;
            contactsSchemaCreate.isHidden = false;
            contactsSchemaCreate.hasTitle = true;
            contactsSchemaCreate.position = 3;
            contactsSchemaCreate.searchUrl = dbRecordUrlConstants.searchUrl;
            contactsSchemaCreate.getUrl = dbRecordUrlConstants.getUrl;
            contactsSchemaCreate.postUrl = dbRecordUrlConstants.postUrl;
            contactsSchemaCreate.putUrl = dbRecordUrlConstants.putUrl;
            contactsSchemaCreate.deleteUrl = dbRecordUrlConstants.deleteUrl;

            const contactSchema = await this.schemasService.createSchemaByPrincipal(
                principal,
                contactsSchemaCreate,
                { upsert: true },
            );
            const contactColumns = await this.schemasColumnsService.updateOrCreateByPrincipal(
                principal,
                contactSchema.id,
                CONTACT.columns,
            );
            initializeResults.push({
                contactColumns,
            });

            /**
             *  Create Addresses Schema
             */
            const addressSchemaCreate = new SchemaCreateUpdateDto();

            addressSchemaCreate.name = SchemaModuleEntityTypes.ADDRESS.name;
            addressSchemaCreate.description = 'addresses for the CRM module.';
            addressSchemaCreate.moduleName = SchemaModuleTypeEnums.CRM_MODULE;
            addressSchemaCreate.entityName = SchemaModuleEntityTypes.ADDRESS.label;
            addressSchemaCreate.isSequential = false;
            addressSchemaCreate.isStatic = true;
            addressSchemaCreate.isHidden = false;
            addressSchemaCreate.hasTitle = true;
            addressSchemaCreate.position = 4;
            addressSchemaCreate.searchUrl = dbRecordUrlConstants.searchUrl;
            addressSchemaCreate.getUrl = dbRecordUrlConstants.getUrl;
            addressSchemaCreate.postUrl = dbRecordUrlConstants.postUrl;
            addressSchemaCreate.putUrl = dbRecordUrlConstants.putUrl;
            addressSchemaCreate.deleteUrl = dbRecordUrlConstants.deleteUrl;

            const addressSchema = await this.schemasService.createSchemaByPrincipal(
                principal,
                addressSchemaCreate,
                { upsert: true },
            );
            const addressColumns = await this.schemasColumnsService.updateOrCreateByPrincipal(
                principal,
                addressSchema.id,
                ADDRESS.columns,
            );
            initializeResults.push({
                addressColumns,
            });


            /**
             *  Create Contact Identities Schema
             */
            const contactsIdentitiesSchemaCreate = new SchemaCreateUpdateDto();
            contactsIdentitiesSchemaCreate.name = SchemaModuleEntityTypes.CONTACT_IDENTITY.name;
            contactsIdentitiesSchemaCreate.description = 'contact identities for the CRM module.';
            contactsIdentitiesSchemaCreate.moduleName = SchemaModuleTypeEnums.CRM_MODULE;
            contactsIdentitiesSchemaCreate.entityName = SchemaModuleEntityTypes.CONTACT_IDENTITY.label;
            contactsIdentitiesSchemaCreate.isSequential = false;
            contactsIdentitiesSchemaCreate.isStatic = true;
            contactsIdentitiesSchemaCreate.isHidden = false;
            contactsIdentitiesSchemaCreate.hasTitle = true;
            contactsIdentitiesSchemaCreate.position = 0;
            contactsIdentitiesSchemaCreate.searchUrl = dbRecordUrlConstants.searchUrl;
            contactsIdentitiesSchemaCreate.getUrl = dbRecordUrlConstants.getUrl;
            contactsIdentitiesSchemaCreate.postUrl = dbRecordUrlConstants.postUrl;
            contactsIdentitiesSchemaCreate.putUrl = dbRecordUrlConstants.putUrl;
            contactsIdentitiesSchemaCreate.deleteUrl = dbRecordUrlConstants.deleteUrl;

            const contactIdentitySchema = await this.schemasService.createSchemaByPrincipal(
                principal,
                contactsIdentitiesSchemaCreate,
                { upsert: true },
            );
            const contactIdentityColumns = await this.schemasColumnsService.updateOrCreateByPrincipal(
                principal,
                contactIdentitySchema.id,
                CONTACT_IDENTITY.columns,
            );
            initializeResults.push({
                contactIdentityColumns,
            });

            /**
             *  Create OrganizationEntity Schema
             */
            const organizationsSchemaCreate = new SchemaCreateUpdateDto();

            organizationsSchemaCreate.name = SchemaModuleEntityTypes.ORGANIZATION.name;
            organizationsSchemaCreate.description = 'organizations for the CRM module.';
            organizationsSchemaCreate.moduleName = SchemaModuleTypeEnums.CRM_MODULE;
            organizationsSchemaCreate.entityName = SchemaModuleEntityTypes.ORGANIZATION.label;
            organizationsSchemaCreate.isSequential = false;
            organizationsSchemaCreate.isStatic = true;
            organizationsSchemaCreate.isHidden = false;
            organizationsSchemaCreate.hasTitle = true;
            organizationsSchemaCreate.position = 0;
            organizationsSchemaCreate.searchUrl = dbRecordUrlConstants.searchUrl;
            organizationsSchemaCreate.getUrl = dbRecordUrlConstants.getUrl;
            organizationsSchemaCreate.postUrl = dbRecordUrlConstants.postUrl;
            organizationsSchemaCreate.putUrl = dbRecordUrlConstants.putUrl;
            organizationsSchemaCreate.deleteUrl = dbRecordUrlConstants.deleteUrl;

            const organizationSchema = await this.schemasService.createSchemaByPrincipal(
                principal,
                organizationsSchemaCreate,
                { upsert: true },
            );
            const organizationColumns = await this.schemasColumnsService.updateOrCreateByPrincipal(
                principal,
                organizationSchema.id,
                ORGANIZATION.columns,
            );
            initializeResults.push({
                organizationColumns,
            });

            /**
             *  Create Visit Entity Schema
             */
            const visitsSchemaCreate = new SchemaCreateUpdateDto();

            visitsSchemaCreate.name = 'visit';
            visitsSchemaCreate.description = 'visits for the CRM module.';
            visitsSchemaCreate.moduleName = SchemaModuleTypeEnums.CRM_MODULE;
            visitsSchemaCreate.entityName = 'Visit';
            visitsSchemaCreate.isSequential = false;
            visitsSchemaCreate.isStatic = true;
            visitsSchemaCreate.isHidden = false;
            visitsSchemaCreate.hasTitle = true;
            visitsSchemaCreate.position = 0;
            visitsSchemaCreate.searchUrl = dbRecordUrlConstants.searchUrl;
            visitsSchemaCreate.getUrl = dbRecordUrlConstants.getUrl;
            visitsSchemaCreate.postUrl = dbRecordUrlConstants.postUrl;
            visitsSchemaCreate.putUrl = dbRecordUrlConstants.putUrl;
            visitsSchemaCreate.deleteUrl = dbRecordUrlConstants.deleteUrl;

            const visitSchema = await this.schemasService.createSchemaByPrincipal(
                principal,
                visitsSchemaCreate,
                { upsert: true },
            );
            const visitColumns = await this.schemasColumnsService.updateOrCreateByPrincipal(
                principal,
                visitSchema.id,
                VISIT.columns,
            );
            initializeResults.push({
                visitColumns,
            });


            // Create contact to addresses associations
            const contactAddressAssociation = new SchemaAssociationCreateUpdateDto();
            contactAddressAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
            contactAddressAssociation.childSchemaId = addressSchema.id;
            contactAddressAssociation.isStatic = true;
            contactAddressAssociation.parentActions = 'LOOKUP_AND_CREATE';
            contactAddressAssociation.cascadeDeleteChildRecord = false;
            contactAddressAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
            contactAddressAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
            contactAddressAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
            contactAddressAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

            try {
                await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                    principal,
                    contactSchema.id,
                    contactAddressAssociation,
                );
            } catch (e) {
                console.error(e);
            }
            initializeResults.push({
                contactAddressAssociation: 1,
            });

            // Create contact to identities associations
            const contactIdentityAssociation = new SchemaAssociationCreateUpdateDto();
            contactIdentityAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
            contactIdentityAssociation.childSchemaId = contactIdentitySchema.id;
            contactIdentityAssociation.isStatic = true;
            contactIdentityAssociation.parentActions = 'LOOKUP_AND_CREATE';
            contactIdentityAssociation.cascadeDeleteChildRecord = false;
            contactIdentityAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
            contactIdentityAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
            contactIdentityAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
            contactIdentityAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

            try {
                await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                    principal,
                    contactSchema.id,
                    contactIdentityAssociation,
                );
            } catch (e) {
                console.error(e);
            }
            initializeResults.push({
                contactIdentityAssociation: 1,
            });

            // Create account to contact associations
            const accountContactAssociation = new SchemaAssociationCreateUpdateDto();
            accountContactAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
            accountContactAssociation.childSchemaId = contactSchema.id;
            accountContactAssociation.isStatic = true;
            accountContactAssociation.parentActions = 'LOOKUP_AND_CREATE';
            accountContactAssociation.cascadeDeleteChildRecord = false;
            accountContactAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
            accountContactAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
            accountContactAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
            accountContactAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

            try {
                await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                    principal,
                    accountSchema.id,
                    accountContactAssociation,
                );
            } catch (e) {
                console.error(e);
            }
            initializeResults.push({
                accountContactAssociation: 1,
            });

            // Create account organization association
            const accountOrganizationAssociation = new SchemaAssociationCreateUpdateDto();
            accountOrganizationAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_ONE;
            accountOrganizationAssociation.childSchemaId = organizationSchema.id;
            accountOrganizationAssociation.isStatic = true;
            accountOrganizationAssociation.parentActions = 'LOOKUP_AND_CREATE';
            accountOrganizationAssociation.childActions = 'READ_ONLY';
            accountOrganizationAssociation.cascadeDeleteChildRecord = false;
            accountOrganizationAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
            accountOrganizationAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
            accountOrganizationAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
            accountOrganizationAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

            try {
                await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                    principal,
                    accountSchema.id,
                    accountOrganizationAssociation,
                );
            } catch (e) {
                console.error(e);
            }
            initializeResults.push({
                accountOrganizationAssociation: 1,
            });

            // Create lead to contact associations
            const leadContactAssociation = new SchemaAssociationCreateUpdateDto();
            leadContactAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
            leadContactAssociation.childSchemaId = contactSchema.id;
            leadContactAssociation.isStatic = true;
            leadContactAssociation.parentActions = 'LOOKUP_AND_CREATE';
            leadContactAssociation.childActions = 'LOOKUP_AND_CREATE';
            leadContactAssociation.cascadeDeleteChildRecord = false;
            leadContactAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
            leadContactAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
            leadContactAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
            leadContactAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

            try {
                await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                    principal,
                    leadSchema.id,
                    leadContactAssociation,
                );
            } catch (e) {
                console.error(e);
            }
            initializeResults.push({
                leadContactAssociation: 1,
            });

            // Create lead organization association
            const leadOrganizationAssociation = new SchemaAssociationCreateUpdateDto();
            leadOrganizationAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_ONE;
            leadOrganizationAssociation.childSchemaId = organizationSchema.id;
            leadOrganizationAssociation.isStatic = true;
            leadOrganizationAssociation.parentActions = 'LOOKUP_AND_CREATE';
            leadOrganizationAssociation.childActions = 'LOOKUP_AND_CREATE';
            leadOrganizationAssociation.cascadeDeleteChildRecord = false;
            leadOrganizationAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
            leadOrganizationAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
            leadOrganizationAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
            leadOrganizationAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

            try {
                await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                    principal,
                    leadSchema.id,
                    leadOrganizationAssociation,
                );
            } catch (e) {
                console.error(e);
            }
            initializeResults.push({
                leadOrganizationAssociation: 1,
            });

            // Create organization to contact associations
            const organizationContactAssociation = new SchemaAssociationCreateUpdateDto();
            organizationContactAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
            organizationContactAssociation.childSchemaId = contactSchema.id;
            organizationContactAssociation.isStatic = true;
            organizationContactAssociation.parentActions = 'LOOKUP_AND_CREATE';
            organizationContactAssociation.childActions = 'LOOKUP_AND_CREATE';
            organizationContactAssociation.cascadeDeleteChildRecord = false;
            organizationContactAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
            organizationContactAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
            organizationContactAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
            organizationContactAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;


            try {
                await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                    principal,
                    organizationSchema.id,
                    organizationContactAssociation,
                );
            } catch (e) {
                console.error(e);
            }
            initializeResults.push({
                organizationContactAssociation: 1,
            });


            //
            // Create an association Account -> Note
            //
            const accountNoteAssociation = new SchemaAssociationCreateUpdateDto();
            accountNoteAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
            accountNoteAssociation.childSchemaId = noteSchema.id;
            accountNoteAssociation.parentActions = 'CREATE_ONLY';
            accountNoteAssociation.childActions = 'READ_ONLY';
            accountNoteAssociation.cascadeDeleteChildRecord = true;
            accountNoteAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
            accountNoteAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
            accountNoteAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
            accountNoteAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

            try {
                await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                    principal,
                    accountSchema.id,
                    accountNoteAssociation,
                );
                initializeResults.push({
                    accountNoteAssociation: 1,
                });
            } catch (e) {
                console.error(e);
            }

            //
            // Create an association Lead -> Note
            //
            const leadNoteAssociation = new SchemaAssociationCreateUpdateDto();
            leadNoteAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
            leadNoteAssociation.childSchemaId = noteSchema.id;
            leadNoteAssociation.parentActions = 'CREATE_ONLY';
            leadNoteAssociation.childActions = 'READ_ONLY';
            leadNoteAssociation.cascadeDeleteChildRecord = true;
            leadNoteAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
            leadNoteAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
            leadNoteAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
            leadNoteAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

            try {
                await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                    principal,
                    leadSchema.id,
                    leadNoteAssociation,
                );
                initializeResults.push({
                    leadNoteAssociation: 1,
                });
            } catch (e) {
                console.error(e);
            }

            //
            // Create an association Contact -> Note
            //
            const contactNoteAssociation = new SchemaAssociationCreateUpdateDto();
            contactNoteAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
            contactNoteAssociation.childSchemaId = noteSchema.id;
            contactNoteAssociation.parentActions = 'CREATE_ONLY';
            contactNoteAssociation.childActions = 'READ_ONLY';
            contactNoteAssociation.cascadeDeleteChildRecord = true;
            contactNoteAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
            contactNoteAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
            contactNoteAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
            contactNoteAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

            try {
                await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                    principal,
                    contactSchema.id,
                    contactNoteAssociation,
                );
                initializeResults.push({
                    contactNoteAssociation: 1,
                });
            } catch (e) {
                console.error(e);
            }

            //
            // Create an association Organization -> Note
            //
            const organizationNoteAssociation = new SchemaAssociationCreateUpdateDto();
            organizationNoteAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
            organizationNoteAssociation.childSchemaId = noteSchema.id;
            organizationNoteAssociation.parentActions = 'CREATE_ONLY';
            organizationNoteAssociation.childActions = 'READ_ONLY';
            organizationNoteAssociation.cascadeDeleteChildRecord = true;
            organizationNoteAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
            organizationNoteAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
            organizationNoteAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
            organizationNoteAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

            try {
                await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                    principal,
                    organizationSchema.id,
                    organizationNoteAssociation,
                );
                initializeResults.push({
                    organizationNoteAssociation: 1,
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
