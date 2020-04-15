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
import { Injectable } from '@nestjs/common';
import { columns } from './files/awsS3/files/file.entity';
import { SchemasAssociationsService } from './schemas/associations/schemas.associations.service';
import { SchemasColumnsService } from './schemas/columns/schemas.columns.service';
import { SchemasService } from './schemas/schemas.service';
import { dbRecordAssociationUrlConstants, dbRecordUrlConstants } from './schemas/url.constants';

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


  public async initialize(principal: OrganizationUserEntity, jwtToken: string): Promise<any> {
    try {

      const noteSchema = await this.schemasService.getSchemaByOrganizationAndEntity(
        principal.organization,
        `${SchemaModuleTypeEnums.SUPPORT_MODULE}:Note`,
      );


      const initializeResults = [];

      /**
       *  Create File Schema and columns
       */
      const fileSchemaCreate = new SchemaCreateUpdateDto();
      fileSchemaCreate.name = SchemaModuleEntityTypes.FILE.name;
      fileSchemaCreate.description = 'files for all modules';
      fileSchemaCreate.moduleName = SchemaModuleTypeEnums.SCHEMA_MODULE;
      fileSchemaCreate.entityName = SchemaModuleEntityTypeEnums.FILE;
      fileSchemaCreate.recordNumber = 1;
      fileSchemaCreate.recordNumberPrefix = SchemaModuleEntityTypes.FILE.prefix;
      fileSchemaCreate.isSequential = true;
      fileSchemaCreate.isStatic = true;
      fileSchemaCreate.isHidden = false;
      fileSchemaCreate.hasTitle = true;
      fileSchemaCreate.isTitleUnique = true;
      fileSchemaCreate.position = 1;
      fileSchemaCreate.searchUrl = 'NA';
      fileSchemaCreate.getUrl = dbRecordUrlConstants.getUrl;
      fileSchemaCreate.postUrl = `${process.env.MODULE_NAME}/v1.0/s3/files/{recordId}/upload`;
      fileSchemaCreate.putUrl = dbRecordUrlConstants.putUrl;
      fileSchemaCreate.deleteUrl = `${process.env.MODULE_NAME}/v1.0/s3/files/{recordId}`;

      const fileSchema = await this.schemasService.createSchemaByPrincipal(
        principal,
        fileSchemaCreate,
        { upsert: true },
      );

      const fileColumns = await this.schemasColumnsService.updateOrCreateByPrincipal(
        principal,
        fileSchema.id,
        columns,
      );
      initializeResults.push({
        fileColumns,
      });


      //
      // Create an association File -> Note
      //
      const fileNoteAssociation = new SchemaAssociationCreateUpdateDto();
      fileNoteAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
      fileNoteAssociation.childSchemaId = noteSchema.id;
      fileNoteAssociation.parentActions = 'CREATE_ONLY';
      fileNoteAssociation.childActions = 'READ_ONLY';
      fileNoteAssociation.cascadeDeleteChildRecord = true;
      fileNoteAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
      fileNoteAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
      fileNoteAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
      fileNoteAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

      try {
        await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
          principal,
          fileSchema.id,
          fileNoteAssociation,
        );
        initializeResults.push({
          fileNoteAssociation: 1,
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
