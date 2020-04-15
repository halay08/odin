import { RabbitmqMessageClient } from '@d19n/client/dist/rabbitmq/rabbitmq.message.client';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { tracer } from '@d19n/common/dist/logging/Tracer';
import { OrganizationEntity } from '@d19n/models/dist/identity/organization/organization.entity';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { LogsConstants } from '@d19n/models/dist/logs/logs.constants';
import {
  SUB_SCHEMA_COLUMN_CREATED,
  SUB_SCHEMA_COLUMN_DELETED,
  SUB_SCHEMA_COLUMN_OPTION_MODIFIED,
  SUB_SCHEMA_COLUMN_UPDATED,
} from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import {
  SchemaColumnCreated,
  SchemaColumnDeleted,
  SchemaColumnOptionModified,
  SchemaColumnUpdated,
} from '@d19n/models/dist/rabbitmq/rabbitmq.interfaces';
import { SchemaColumnCreateUpdateDto } from '@d19n/models/dist/schema-manager/schema/column/dto/schema.column.create.update.dto';
import { SchemaColumnEntity } from '@d19n/models/dist/schema-manager/schema/column/schema.column.entity';
import { SchemaColumnTypes } from '@d19n/models/dist/schema-manager/schema/column/types/schema.column.types';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { validate } from 'class-validator';
import { DeleteResult } from 'typeorm';
import { DbCacheService } from '../../cache/db.cache.service';
import { IMethodOptions } from '../../db/interfaces/interfaces';
import { LogsUserActivityService } from '../../logs/user-activity/logs.user.activity.service';
import { SchemasService } from '../schemas.service';
import { SchemasColumnsOptionsService } from './options/schemas.columns.options.service';
import { SchemasColumnsRepository } from './schemas.columns.repository';
import { SchemasColumnsValidatorsService } from './validators/schemas.columns.validators.service';

class schemaColumnServiceOptions {
  public updateIfExists: boolean = true;
}

const { SCHEMA_MODULE } = SchemaModuleTypeEnums;

@Injectable()
export class SchemasColumnsService {

  private messageClient: RabbitmqMessageClient;

  public constructor(
    public amqpConnection: AmqpConnection,
    @InjectRepository(SchemasColumnsRepository) private schemasColumnsRepository: SchemasColumnsRepository,
    @Inject(forwardRef(() => SchemasService)) private schemasService: SchemasService,
    @Inject(forwardRef(() => LogsUserActivityService)) private logsUserActivityService: LogsUserActivityService,
    private schemasColumnsOptionsService: SchemasColumnsOptionsService,
    private schemasColumnsValidatorsService: SchemasColumnsValidatorsService,
    private dbCacheService: DbCacheService,
  ) {

    this.schemasColumnsRepository = schemasColumnsRepository;
    this.schemasService = schemasService;
    this.schemasColumnsOptionsService = schemasColumnsOptionsService;
    this.schemasColumnsValidatorsService = schemasColumnsValidatorsService;
    this.logsUserActivityService = logsUserActivityService;
    this.dbCacheService = dbCacheService;

    this.messageClient = new RabbitmqMessageClient(amqpConnection);

  }

  /**
   *
   * @param organization
   * @param {string} schemaId
   *
   * @param options
   * @returns {Promise<Array<SchemaColumnEntity>>}
   */
  public async getSchemaColumnsByOrganizationAndSchemaId(
    principal: OrganizationEntity | OrganizationUserEntity,
    schemaId: string,
    options?: IMethodOptions,
  ): Promise<SchemaColumnEntity[]> {
    try {

      let organization = principal

      if(principal instanceof OrganizationUserEntity) {
        organization = principal.organization
      }

      const trace = await tracer.startSpan(
        'getSchemaColumnsByOrganizationAndSchemaId',
        { childOf: options && options.tracerParent ? options.tracerParent.context() : undefined },
      );

      // Add caching
      const cacheKey = `schemaColumnsService-getSchemaColumnsByOrganizationAndSchemaId-${organization.id}-${schemaId}`;
      const cached = await this.dbCacheService.getFromCache<SchemaColumnEntity[]>(cacheKey);

      if(cached) {
        trace.finish();
        return cached;
      }

      const response: SchemaColumnEntity[] = await this.schemasColumnsRepository.listSchemaColumnsByOrganizationAndSchemaId(
        organization,
        schemaId,
      );

      if(!response) {
        throw new ExceptionType(404, 'not found');
      }

      await this.dbCacheService.saveToCache<SchemaColumnEntity[]>(cacheKey, response);

      trace.finish();

      return response;
    } catch (e) {
      throw  new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }

  /**
   *
   * @param organization
   * @param schemaId
   * @param columnId
   *
   */
  public async getByOrganizationAndSchemaIdAndId(
    principal: OrganizationEntity | OrganizationUserEntity,
    schemaId: string,
    columnId: string,
  ): Promise<SchemaColumnEntity> {
    try {

      let organization = principal

      if(principal instanceof OrganizationUserEntity) {
        organization = principal.organization
      }

      const column: SchemaColumnEntity = await this.schemasColumnsRepository.getSchemaColumnByOrganizationAndSchemaIdAndId(
        organization,
        schemaId,
        columnId,
      );

      if(!column) {
        throw new ExceptionType(404, 'not found');
      }
      return column;
    } catch (e) {
      throw  new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }


  /**
   *
   * @param principal
   * @param schemaId
   * @param body
   */
  public async createByPrincipal(
    principal: OrganizationUserEntity,
    schemaId: string,
    body: SchemaColumnCreateUpdateDto,
  ): Promise<SchemaColumnEntity> {
    try {

      await this.dbCacheService.clearSchemasFromCache(principal.organization, schemaId);

      return await this.updateOrCreateByPrincipalAndSchema(
        principal,
        schemaId,
        body,
        { updateIfExists: false },
      );

    } catch (e) {
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }

  /**
   *
   * @param principal
   * @param schemaId
   * @param body
   */
  public async updateOrCreateByPrincipal(
    principal: OrganizationUserEntity,
    schemaId: string,
    body: SchemaColumnCreateUpdateDto [],
  ): Promise<SchemaColumnEntity[]> {
    try {
      let batchCreates = [];

      for(let x in body) {
        const res: SchemaColumnEntity = await this.updateOrCreateByPrincipalAndSchema(
          principal,
          schemaId,
          body[x],
          { updateIfExists: true },
        );

        batchCreates.push(res);
      }

      await this.dbCacheService.clearSchemasFromCache(principal.organization, schemaId);

      return batchCreates;
    } catch (e) {
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }


  /**
   *
   * @param principal
   * @param {String} schemaId
   * @param body
   *
   * @param options
   */
  public async updateOrCreateByPrincipalAndSchema(
    principal: OrganizationUserEntity,
    schemaId: string,
    body: SchemaColumnCreateUpdateDto,
    options?: schemaColumnServiceOptions,
  ): Promise<SchemaColumnEntity> {
    try {
      // Set the response
      let response: SchemaColumnEntity;
      // Get the schema
      const schema: SchemaEntity = await this.schemasService.getSchemaByOrganizationAndId(
        principal.organization,
        {
          schemaId,
        },
      );
      // Get the schema column
      const schemaColumn: SchemaColumnEntity = await this.schemasColumnsRepository.getSchemaColumnByOrganizationAndSchemaIdAndName(
        principal.organization,
        schemaId,
        body.schemaTypeId,
        body.name,
      );
      // handle update or create
      if(schemaColumn) {
        response = await this.updateExistingColumn(principal, schemaColumn, body, schemaId, options);
      } else {
        response = await this.createNewSchemaColumn(principal, schema, body, options);
      }
      // Fetch the latest record
      const schemaColumnRes: SchemaColumnEntity = await this.schemasColumnsRepository.getSchemaColumnByOrganizationAndSchemaIdAndId(
        principal.organization,
        schema.id,
        response.id,
      );

      await this.dbCacheService.clearSchemasFromCache(principal.organization, schema.id);
      await this.dbCacheService.clearSchemasFromCache(
        principal.organization,
        `${schema.moduleName}:${schema.entityName}`,
      );

      return schemaColumnRes;
    } catch (e) {
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }

  /**
   *
   * @param principal
   * @param schema
   * @param body
   * @param schemaColumn
   */
  private async updateOrCreateOptionsAndValidators(
    principal: OrganizationUserEntity,
    schema: SchemaEntity,
    body: SchemaColumnCreateUpdateDto,
    schemaColumn: SchemaColumnEntity,
  ) {
    try {

      // update or create validators
      if(body.validators && schemaColumn) {

        await this.schemasColumnsValidatorsService.batchUpdateOrCreateByOrganizationEntity(
          principal,
          schemaColumn,
          body.validators,
        );

      }

      // update or create options
      if(body.options && schemaColumn) {

        const { updateResults, createResults, deleteResults } = await this.schemasColumnsOptionsService.batchUpdateOrCreateByOrganizationEntity(
          principal,
          schemaColumn,
          body.options,
        );

        // publish column update event
        this.messageClient.publish<SchemaColumnOptionModified>(
          SCHEMA_MODULE,
          `${SCHEMA_MODULE}.${SUB_SCHEMA_COLUMN_OPTION_MODIFIED}`,
          {
            principal: principal,
            schema,
            schemaColumn,
            updateResults,
            createResults,
            deleteResults,
          },
        );

      }
    } catch (e) {

      throw new ExceptionType(e.statusCode, e.message, e.validation);

    }
  }

  /**
   *
   * @param principal
   * @param schemaColumn
   * @param body
   * @param schemaId
   * @param options
   */
  private async updateExistingColumn(
    principal: OrganizationUserEntity,
    schemaColumn: SchemaColumnEntity,
    body: SchemaColumnCreateUpdateDto,
    schemaId: string,
    options?: schemaColumnServiceOptions,
  ): Promise<SchemaColumnEntity> {
    try {

      if(!options.updateIfExists) {

        throw new ExceptionType(409, 'conflict a column with that name already exists');

      } else {

        schemaColumn.name = body.name ? body.name.trim() : undefined;
        schemaColumn.schemaTypeId = body.schemaTypeId;
        schemaColumn.description = body.description ? body.description.trim() : undefined;
        schemaColumn.type = SchemaColumnTypes[body.type];
        schemaColumn.label = body.label;
        schemaColumn.mapping = body.mapping;
        schemaColumn.position = body.position;
        schemaColumn.columnPosition = body.columnPosition;
        schemaColumn.category = body.category;
        schemaColumn.transform = body.transform;
        schemaColumn.placeholder = body.placeholder;
        schemaColumn.defaultValue = body.defaultValue;
        schemaColumn.isHidden = body.isHidden;
        schemaColumn.isDisabled = body.isDisabled;
        schemaColumn.isStatic = body.isStatic;
        schemaColumn.isStatusColumn = body.isStatusColumn;
        schemaColumn.isTitleColumn = body.isTitleColumn;
        schemaColumn.isVisibleInTables = body.isVisibleInTables;

        const errors = await validate(schemaColumn, { skipNullProperties: true, skipUndefinedProperties: true });

        if(errors.length > 0) {
          throw new ExceptionType(422, 'validation error', errors);
        }

        const response = await this.schemasColumnsRepository.save(schemaColumn);

        await this.logsUserActivityService.createByPrincipal(
          principal,
          response.id,
          response,
          LogsConstants.SCHEMA_COLUMN_UPDATED,
        );

        // Get the schema
        const schema: SchemaEntity = await this.schemasService.getSchemaByOrganizationAndId(
          principal.organization,
          {
            schemaId,
          },
        );

        await this.updateOrCreateOptionsAndValidators(principal, schema, body, response);

        await this.dbCacheService.clearSchemasFromCache(principal.organization, schema.id);
        await this.dbCacheService.clearSchemasFromCache(
          principal.organization,
          `${schema.moduleName}:${schema.entityName}`,
        );

        // publish column update event
        this.messageClient.publish<SchemaColumnUpdated>(
          SCHEMA_MODULE,
          `${SCHEMA_MODULE}.${SUB_SCHEMA_COLUMN_UPDATED}`,
          {
            event: LogsConstants.SCHEMA_COLUMN_UPDATED,
            principal: principal,
            schema,
            schemaColumn: response,
          },
        );

        return await this.getByOrganizationAndSchemaIdAndId(principal.organization, schemaId, response.id);
      }
    } catch (e) {
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }

  /**
   *
   * @param principal
   * @param schema
   * @param body
   * @param options
   */
  private async createNewSchemaColumn(
    principal: OrganizationUserEntity,
    schema: SchemaEntity,
    body: SchemaColumnCreateUpdateDto,
    options?: schemaColumnServiceOptions,
  ): Promise<SchemaColumnEntity> {
    try {

      const schemaColumn = new SchemaColumnEntity();
      schemaColumn.organization = principal.organization;
      schemaColumn.schemaTypeId = body.schemaTypeId;
      schemaColumn.schema = schema;
      schemaColumn.name = body.name.trim();
      schemaColumn.type = body.type;
      schemaColumn.label = body.label;
      schemaColumn.mapping = body.mapping;
      schemaColumn.defaultValue = body.defaultValue;
      schemaColumn.placeholder = body.placeholder;
      schemaColumn.position = body.position || 0;
      schemaColumn.columnPosition = body.columnPosition || 1;
      schemaColumn.category = body.category;
      schemaColumn.transform = body.transform;
      schemaColumn.description = body.description;
      schemaColumn.isStatic = body.isStatic ? body.isStatic : false;
      schemaColumn.isHidden = body.isHidden ? body.isHidden : false;
      schemaColumn.isDisabled = body.isDisabled ? body.isHidden : false;
      schemaColumn.isTitleColumn = body.isTitleColumn ? body.isTitleColumn : false;
      schemaColumn.isStatusColumn = body.isStatusColumn;
      schemaColumn.isVisibleInTables = body.isVisibleInTables;

      delete schemaColumn.validators;
      delete schemaColumn.options;

      const errors = await validate(schemaColumn);
      if(errors.length > 0) {
        throw new ExceptionType(422, 'validation error', errors);
      }
      const response = await this.schemasColumnsRepository.save(schemaColumn);
      await this.logsUserActivityService.createByPrincipal(
        principal,
        schemaColumn.id,
        response,
        LogsConstants.SCHEMA_COLUMN_CREATED,
      );

      await this.updateOrCreateOptionsAndValidators(principal, schema, body, response);

      await this.dbCacheService.clearSchemasFromCache(principal.organization, schema.id);
      await this.dbCacheService.clearSchemasFromCache(
        principal.organization,
        `${schema.moduleName}:${schema.entityName}`,
      );

      // publish column update event
      this.messageClient.publish<SchemaColumnCreated>(
        SCHEMA_MODULE,
        `${SCHEMA_MODULE}.${SUB_SCHEMA_COLUMN_CREATED}`,
        {
          event: LogsConstants.SCHEMA_COLUMN_CREATED,
          principal: principal,
          schema,
          schemaColumn: response,
        },
      );

      return response;
    } catch (e) {
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }


  /**
   *
   * @param principal
   * @param schemaId
   * @param columnId
   * @param body
   *
   */
  public async updateByPrincipalAndSchemaIdAndId(
    principal: OrganizationUserEntity,
    schemaId: string,
    columnId: string,
    body: SchemaColumnCreateUpdateDto,
  ): Promise<SchemaColumnEntity> {
    try {

      const schemaColumn: SchemaColumnEntity = await this.schemasColumnsRepository.findOne({
        where: { organizationId: principal.organization.id, id: columnId, schemaId: schemaId },
      });

      if(!schemaColumn) {

        throw new ExceptionType(404, 'not found');

      }

      return await this.updateExistingColumn(principal, schemaColumn, body, schemaId, { updateIfExists: true });

    } catch (e) {
      console.error(e);
      throw  new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }

  /**
   *
   * @param principal
   * @param schemaId
   * @param  columnId
   *
   */
  public async deleteByPrincipalAndSchemaAndId(
    principal: OrganizationUserEntity,
    schemaId: string,
    columnId: string,
  ): Promise<{ affected: number }> {
    try {

      // Get the schema
      const schema: SchemaEntity = await this.schemasService.getSchemaByOrganizationAndId(
        principal.organization,
        {
          schemaId,
        },
      );
      // get the schema column
      // check if db_records exist
      const records = await this.schemasColumnsRepository.query(`SELECT id FROM db_records_columns WHERE schema_id = '${schemaId}' AND column_id = '${columnId}' LIMIT 1`);
      if(records.length > 0) {
        throw new ExceptionType(409, 'this column has records and cannot be deleted');
      }

      const schemaColumn = await this.getByOrganizationAndSchemaIdAndId(principal.organization, schemaId, columnId);

      const deleteResult: DeleteResult = await this.schemasColumnsRepository.delete({
        organization: principal.organization,
        id: columnId,
      });

      // Log event
      await this.logsUserActivityService.createByPrincipal(principal, columnId, {
        id: columnId,
        affected: deleteResult.affected,
      }, LogsConstants.SCHEMA_COLUMN_DELETED);

      // clear schema cache
      await this.dbCacheService.clearSchemasFromCache(principal.organization, schema.id);
      await this.dbCacheService.clearSchemasFromCache(
        principal.organization,
        `${schema.moduleName}:${schema.entityName}`,
      );

      // publish column update event
      this.messageClient.publish<SchemaColumnDeleted>(
        SCHEMA_MODULE,
        `${SCHEMA_MODULE}.${SUB_SCHEMA_COLUMN_DELETED}`,
        {
          event: LogsConstants.SCHEMA_COLUMN_DELETED,
          principal: principal,
          schema,
          schemaColumn,
        },
      );

      return { affected: deleteResult.affected };
    } catch (e) {
      throw  new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }
}
