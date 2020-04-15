import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
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
import { dbRecordUrlConstants } from '@d19n/schema-manager/dist/schemas/url.constants';
import { Injectable } from '@nestjs/common';
import * as NOTE from './notes/note.entity';

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


    public async initialize(principal: OrganizationUserEntity, jwtToken: string): Promise<any> {
        try {

            const initializeResults = [];


            /**
             *  Create Program Schema
             */
            const noteSchemaCreate = new SchemaCreateUpdateDto();
            noteSchemaCreate.name = SchemaModuleEntityTypes.NOTE.name;
            noteSchemaCreate.description = 'notes for the support module.';
            noteSchemaCreate.moduleName = SchemaModuleTypeEnums.SUPPORT_MODULE;
            noteSchemaCreate.entityName = SchemaModuleEntityTypeEnums.NOTE;
            noteSchemaCreate.recordNumber = 1;
            noteSchemaCreate.recordNumberPrefix = SchemaModuleEntityTypes.NOTE.prefix;
            noteSchemaCreate.isSequential = true;
            noteSchemaCreate.isStatic = true;
            noteSchemaCreate.isHidden = false;
            noteSchemaCreate.hasTitle = true;
            noteSchemaCreate.isTitleUnique = true;
            noteSchemaCreate.position = 1;
            noteSchemaCreate.searchUrl = dbRecordUrlConstants.searchUrl;
            noteSchemaCreate.getUrl = dbRecordUrlConstants.getUrl;
            noteSchemaCreate.postUrl = dbRecordUrlConstants.postUrl;
            noteSchemaCreate.putUrl = dbRecordUrlConstants.putUrl;
            noteSchemaCreate.deleteUrl = dbRecordUrlConstants.deleteUrl;

            const noteSchema = await this.schemasService.createSchemaByPrincipal(
                principal,
                noteSchemaCreate,
                { upsert: true },
            );

            const noteColumns = await this.schemasColumnsService.updateOrCreateByPrincipal(
                principal,
                noteSchema.id,
                NOTE.columns,
            );
            initializeResults.push({
                noteColumns,
            });


            return initializeResults;

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }
}
