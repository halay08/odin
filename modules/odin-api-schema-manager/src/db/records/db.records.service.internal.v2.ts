import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { tracer } from '@d19n/common/dist/logging/Tracer';
import { OrganizationEntity } from '@d19n/models/dist/identity/organization/organization.entity';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { LogsConstants } from '@d19n/models/dist/logs/logs.constants';
import {
  CREATE_DB_RECORD_ASSOCIATIONS,
  RPC_GET_ORG_APP_BY_NAME,
  RPC_GET_USER_BY_ID,
  SUB_DB_RECORD_CREATED,
  SUB_DB_RECORD_DELETED,
  SUB_DB_RECORD_OWNER_ASSIGNED,
  SUB_DB_RECORD_UPDATED,
} from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import { RelationTypeEnum } from '@d19n/models/dist/schema-manager/db/record/association/types/db.record.association.constants';
import { DbRecordEntity } from '@d19n/models/dist/schema-manager/db/record/db.record.entity';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { IDbRecordCreateUpdateRes } from '@d19n/models/dist/schema-manager/db/record/interfaces/interfaces';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import {
  shouldTriggerCreateEvent,
  shouldTriggerUpdateEvent,
  splitEntityToModuleAndEntity,
} from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaColumnEntity } from '@d19n/models/dist/schema-manager/schema/column/schema.column.entity';
import { SchemaColumnValidatorTypes } from '@d19n/models/dist/schema-manager/schema/column/validator/schema.column.validator.types';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { constantCase } from 'change-case';
import { validate, ValidationError } from 'class-validator';
import { DeleteResult } from 'typeorm';
import { ColumnValueUtilities } from '../../helpers/ColumnValueUtilities';
import { LogsUserActivityService } from '../../logs/user-activity/logs.user.activity.service';
import { PipelineEntitysStagesService } from '../../pipelines/stages/pipelines.stages.service';
import { SchemasColumnsService } from '../../schemas/columns/schemas.columns.service';
import { SchemasService } from '../../schemas/schemas.service';
import {
  IGetDbRecordByExternalIdParams,
  IGetDbRecordByIdParams,
  IGetManyRecordsByIdsParams,
  IMethodOptions,
} from '../interfaces/interfaces';
import { DbSearchService } from '../search/db.search.service';
import { DbRecordDeleted } from '../types/db.record.deleted';
import { DbRecordsAssociationsService } from './associations/db.records.associations.service';
import { DbRecordsColumnsRepository } from './columns/db.records.columns.repository';
import { DbRecordsColumnsService } from './columns/db.records.columns.service';
import { DbRecordsRepository } from './db.records.repository';
import moment = require('moment');

export class dbRecordServiceOptions {
  public upsert: boolean = true;
}

const { NOTIFICATION_MODULE, IDENTITY_MODULE } = SchemaModuleTypeEnums;


@Injectable()
export class DbRecordsPrincipalServiceInternal extends DbRecordsColumnsService {

  protected readonly logsUserActivityService: LogsUserActivityService;
  protected readonly schemasColumnsService: SchemasColumnsService;
  protected readonly dbRecordsColumnsRepository: DbRecordsColumnsRepository;

  private readonly dbRecordsRepository: DbRecordsRepository;
  private readonly dbRecordsAssociationsService: DbRecordsAssociationsService;
  private readonly pipelineStageService: PipelineEntitysStagesService;
  private readonly dbSearchService: DbSearchService;
  private readonly schemasService: SchemasService;
  private readonly amqpConnection: AmqpConnection;

  public constructor(
    @Inject(forwardRef(() => DbRecordsAssociationsService)) dbRecordsAssociationsService: DbRecordsAssociationsService,
    @Inject(forwardRef(() => DbSearchService)) dbSearchService: DbSearchService,
    @Inject(forwardRef(() => SchemasService)) schemasService: SchemasService,
    @Inject(forwardRef(() => SchemasColumnsService)) schemasColumnsService: SchemasColumnsService,
    @Inject(forwardRef(() => LogsUserActivityService)) logsUserActivityService: LogsUserActivityService,
      amqpConnection: AmqpConnection,
      pipelineStageService: PipelineEntitysStagesService,
      dbRecordsRepository: DbRecordsRepository,
      dbRecordsColumnsRepository: DbRecordsColumnsRepository,
  ) {

    super(dbRecordsColumnsRepository, logsUserActivityService, schemasColumnsService);

    this.dbRecordsRepository = dbRecordsRepository;
    this.dbRecordsAssociationsService = dbRecordsAssociationsService;
    this.logsUserActivityService = logsUserActivityService;
    this.pipelineStageService = pipelineStageService;
    this.dbSearchService = dbSearchService;
    this.schemasService = schemasService;
    this.amqpConnection = amqpConnection;

  }


  /**
   *
   * @param principal
   * @param params
   * @param options
   */
  public async _getDbRecordByExternalId(
    principal: OrganizationUserEntity,
    params: IGetDbRecordByExternalIdParams,
    options?: IMethodOptions,
  ): Promise<DbRecordEntity> {

    const trace = await tracer.startSpan(
      'dbRecordsService.getDbRecordByOrganizationAndExternalId',
      { childOf: options && options.tracerParent ? options.tracerParent.context() : undefined },
    ).setTag('params', params);

    const { externalId } = params;

    const dbRecord = await this.dbRecordsRepository.getDbRecordByOrganizationAndExternalId(
      principal,
      externalId,
    );

    trace.finish();

    return dbRecord;
  }


  /**
   *
   * @param organization
   * @param params
   * @param options
   */
  public async _getDbRecordsByColumnAndValues(
    organization: OrganizationEntity,
    params: {
      schemaColumnId: string,
      values: string[],
      schemaTypeId?: string,
    },
    options?: IMethodOptions,
  ): Promise<DbRecordEntity[]> {
    try {

      const trace = await tracer.startSpan(
        '_getDbRecordsByColumnAndValues',
        { childOf: options && options.tracerParent ? options.tracerParent.context() : undefined },
      );

      const { schemaColumnId, values, schemaTypeId } = params;

      // Get recordIds by column and value
      const recordIds: { record_id: string }[] = await this.getDbRecordColumnsByOrganizationAndColumnAndValues(
        organization,
        schemaColumnId,
        values,
        schemaTypeId,
      );

      if(recordIds.length > 0) {
        const ids: string[] = recordIds.map(elem => elem.record_id);

        const records = await this.dbRecordsRepository.getManyDbRecordsByOrganizationsAndIds(organization, ids);

        trace.finish();

        return records;

      } else {
        return [];
      }
    } catch (e) {
      console.error(e);
      throw new ExceptionType(e.statusCode, 'error returning list by column and values');
    }
  }

  /**
   *
   * @param principal
   * @param recordId
   */
  public async _deleteDbRecordById(
    principal: OrganizationUserEntity,
    recordId: string,
    excludedDeletes?: string[],
  ): Promise<DbRecordDeleted[]> {
    try {

      const processAsync = [];
      const deletedRecords = [];

      let recordsToDelete = [ recordId ];

      // get db record
      const record = await this._getDbRecordById(principal, { recordId });

      // get db record associations where cascadeDeleteTrue;
      // We need to load the full schema associations (parent & child)
      const { associations } = await this.schemasService.getSchemaByOrganizationAndIdWithAssociations(
        principal.organization,
        { schemaId: record.schemaId },
      );

      const childAssociations = associations.filter(elem => elem.childSchema && elem.cascadeDeleteChildRecord);
      const entities = childAssociations.map(elem => elem.childSchema.entityName);

      if(childAssociations && childAssociations.length > 0) {

        const relatedRecords = await this.dbRecordsAssociationsService.getRelatedRecordsByEntity(
          principal.organization,
          {
            recordId,
            entities: childAssociations.map(elem => elem.childSchema.entityName),
            associations,
          },
        );

        if(relatedRecords) {

          for(const entity of entities) {

            const relation = relatedRecords[entity];

            if(relation && relation.dbRecords) {

              // related records with self relationships return the parent and child relations
              // we only want to cascade delete the child records
              const childRecords = relation.dbRecords.filter(elem => elem.relationType === RelationTypeEnum.CHILD);

              recordsToDelete.push(...childRecords.map((elem: DbRecordEntityTransform) => elem.id));

            }

          }

        }

      }

      // Exclude any record ids that are added to the exclude deletes array
      if(excludedDeletes) {
        recordsToDelete = recordsToDelete.filter(id => !excludedDeletes.includes(id));
      }

      if(recordsToDelete && recordsToDelete.length > 0) {
        const records = await this._getManyDbRecordsByIds(
          principal,
          {
            recordIds: recordsToDelete,
          },
        );

        for(const record of records) {
          const deleteResult: DeleteResult = await this.softDeleteByPrincipalAndDbRecord(
            principal,
            record,
          );

          deletedRecords.push({ id: record.id, affected: deleteResult.affected });
        }

        await Promise.all(processAsync.map(elem => elem.func));
      }

      return deletedRecords;

    } catch (e) {
      throw new ExceptionType(e.statusCode, e.message, e.validation, e.data);
    }
  }


  /**
   * we soft delete the record to allow aggregation methods / processes to run and restoring
   * in the event of accidental delete.
   * @param principal
   * @param dbRecord
   */
  public async softDeleteByPrincipalAndDbRecord(
    principal: OrganizationUserEntity,
    dbRecord: DbRecordEntity,
  ): Promise<DeleteResult> {

    try {

      const deleteResult: DeleteResult = await this.dbRecordsRepository.softDelete(principal.organization, dbRecord.id);

      // soft delete columns
      await this.softDeleteColumnsByRecordId(principal, dbRecord.id);

      // soft delete all associations for this record
      await this.dbRecordsAssociationsService.deleteByRecordId(principal, dbRecord.id);

      const { entityName } = splitEntityToModuleAndEntity(dbRecord.entity);

      if(deleteResult.affected > 0) {
        this.amqpConnection.publish(
          process.env.MODULE_NAME,
          `${process.env.MODULE_NAME}.${entityName}.${SUB_DB_RECORD_DELETED}`,
          {
            event: LogsConstants.DB_RECORD_DELETED,
            principal: principal,
            id: dbRecord.id,
            affected: deleteResult.affected,
          },
        );

        this.dbSearchService.deleteRecordFromSearchDatabase(dbRecord.id, dbRecord.schemaId);

        this.logsUserActivityService.createByPrincipal(principal, dbRecord.id, {
          id: dbRecord.id,
          affected: deleteResult.affected,
        }, LogsConstants.DB_RECORD_DELETED);
      }
      return deleteResult;
    } catch (e) {
      console.error(e);
      throw new ExceptionType(e.statusCode, e.message, e.validation, e.data);
    }
  }

  /**
   * @param principal
   * @param params
   * @param options
   */
  public async _getManyDbRecordsByIds(
    principal: OrganizationUserEntity,
    params: IGetManyRecordsByIdsParams,
    options?: IMethodOptions,
  ): Promise<DbRecordEntity[]> {
    try {
      const trace = await tracer.startSpan(
        '_getManyDbRecordsByIds',
        { childOf: options && options.tracerParent ? options.tracerParent.context() : undefined },
      ).setTag('params', params);

      const { recordIds } = params;

      const records = await this.dbRecordsRepository.getManyDbRecordsByOrganizationsAndIds(principal, recordIds);

      trace.finish();

      return records && records.length > 0 ? records : undefined;

    } catch (e) {
      console.error(e);
      throw new ExceptionType(404, 'record not found');
    }
  }

  /**
   * This method is intended to be used when creating records with all the records
   * required properties.
   *
   * @param principal
   * @param body
   * @param options
   */
  public async _updateOrCreateDbRecords(
    principal: OrganizationUserEntity,
    body: DbRecordCreateUpdateDto,
    options?: IMethodOptions,
  ): Promise<IDbRecordCreateUpdateRes> {
    try {

      // Get the schema
      const schema = await this.schemasService.getSchemaByOrganizationAndEntityOrId(principal.organization, body);
      // Find a record by unique columns which are passed in the body.properties: { Key: Value }

      const { recordId } = await this.checkIfRecordExists(principal, body, schema, options);

      // If there is a dbRecord and the schema upsertOnCreate is false
      // throw an error
      if(!!recordId && !schema.upsertOnCreate) {
        // throw an error if upsert is false
        DbRecordsPrincipalServiceInternal.throwRecordAlreadyExistsException(recordId, schema, body.title);

      } else if(!!recordId) {

        // update the existing record
        return await this._updateDbRecordById(principal, recordId, body, options);

      } else {

        // create a new record
        return await this.createDbRecordByPrincipal(principal, body, options);
      }
    } catch (e) {
      console.error(e);
      throw new ExceptionType(e.statusCode, e.message, e.validation, e.data);
    }
  }

  /**
   * update an existing record
   * @param principal
   * @param recordId
   * @param body
   * @param options
   */
  public async _updateDbRecordById(
    principal: OrganizationUserEntity,
    recordId: string,
    body: DbRecordCreateUpdateDto,
    options?: IMethodOptions,
  ): Promise<IDbRecordCreateUpdateRes> {
    try {

      const trace = await tracer.startSpan(
        'updateDbRecord',
        { childOf: options && options.tracerParent ? options.tracerParent.context() : undefined },
      );
      // validate only if there are properties
      if(!!body.properties) {
        await DbRecordsPrincipalServiceInternal.validateCreateUpdateBody(body);
      }
      // Get the schema
      const schema = await this.schemasService.getSchemaByOrganizationAndEntityOrId(principal.organization, body);

      // Get the dbRecord
      const dbRecord = await this._getDbRecordById(
        principal,
        { recordId },
        { tracerParent: trace },
      );

      // To prevent accidental updates to a record and its schema
      const isSchemaDiff = this.isSchemaDiff(dbRecord, schema);
      if(isSchemaDiff) {
        throw new ExceptionType(
          409,
          'conflict the record schema does not match the entity / schema you are updating with',
        );
      }

      // Only execute logging, triggers if the record properties have changed
      const isRecordDiff = this.isRecordDiff(dbRecord, body);
      
      //get user groups from id and add it to the records
      if(body.groups){
        dbRecord.groups = await this.dbRecordsRepository.findM2MLinks(body.groups)
      }

      // set the record stage (undefined if the entity does not have a pipeline)
      if(body.stageId) {
        const stage = await this.pipelineStageService.getPipelineStageByIdOrReturnDefault(
          principal,
          {
            moduleName: schema.moduleName,
            entityName: schema.entityName,
            stageId: body.stageId,
          },
          { tracerParent: trace },
        );

        // update the stage update timestamp
        dbRecord.stageUpdatedAt = moment().utc().toDate();
        dbRecord.stage = stage;

      }

      // do not allow the title to be null if these are true
      if(body.hasOwnProperty('title')) {

        await this.validateRecordTitleConstraintsWithBody(body, schema);

        dbRecord.title = body.title;

      }

      dbRecord.lastModifiedBy = principal;

      // save the dbRecord
      if(isRecordDiff) {

        const res = await this.dbRecordsRepository.persist(dbRecord);

        // make the assignee the owner of the record
        await this.assignDbRecordToUser(principal, schema, res, body);
      }

      // save all the records columns
      const columns = await this.updateOrCreateDbRecordColumns(
        principal,
        dbRecord,
        schema,
        body,
        { tracerParent: trace },
      );

      // Create record associations
      if(body.associations && body.associations.length > 0) {

        // publish message record created
        this.amqpConnection.publish(
          process.env.MODULE_NAME,
          `${process.env.MODULE_NAME}.${CREATE_DB_RECORD_ASSOCIATIONS}`,
          {
            principal: principal,
            id: dbRecord.id,
            body: body.associations,
          },
        );
      }

      // If the record is different log an event and re-index
      if(isRecordDiff || columns.length > 0) {
        // if the stageId is set then the event is a stage update
        // otherwise it is only record properties that updated
        const eventType = !!body.stageId ? LogsConstants.DB_RECORD_STAGE_UPDATED : LogsConstants.DB_RECORD_UPDATED;

        // log revision
        this.logsUserActivityService.createByPrincipal(principal, dbRecord.id, body, eventType);

        // re-index search database
        this.dbSearchService.reIndexSearchDatabaseForRecord(principal, dbRecord.id, schema.id);
        // load the records columns

        if(shouldTriggerUpdateEvent(body)) {
          // publish message event
          this.amqpConnection.publish(
            process.env.MODULE_NAME,
            `${process.env.MODULE_NAME}.${schema.entityName}.${SUB_DB_RECORD_UPDATED}`,
            {
              event: eventType,
              principal: principal,
              id: dbRecord.id,
              body,
            },
          );
        }
      }

      trace.finish();

      return { id: dbRecord.id, entity: dbRecord.entity };

    } catch (e) {
      console.error(e);
      throw new ExceptionType(e.statusCode, e.message, e.validation, e.data);
    }
  }

  /**
   * @param principal
   * @param body
   */
  private async createDbRecordByPrincipal(
    principal: OrganizationUserEntity,
    body: DbRecordCreateUpdateDto,
    options?: IMethodOptions,
  ): Promise<IDbRecordCreateUpdateRes> {
    try {

      const trace = await tracer.startSpan(
        'createDbRecordByPrincipal',
        { childOf: options && options.tracerParent ? options.tracerParent.context() : undefined },
      );

      // validate only if there are properties
      if(!!body.properties) {
        await DbRecordsPrincipalServiceInternal.validateCreateUpdateBody(body);
      }


      // Get the schema
      const schema = await this.schemasService.getSchemaByOrganizationAndEntityOrId(principal.organization, body);

      if(!schema) {

        throw new ExceptionType(404, 'could not create record, schema not found.');

      }

      // generate a new record number
      const { recordNumber, recordNumberPrefix } = await this.schemasService.generateNewRecordNumberFromSchema(
        principal.organization,
        schema.id,
        { tracerParent: trace },
      );
      // set the record stage
      const stage = await this.pipelineStageService.getPipelineStageByIdOrReturnDefault(
        principal,
        {
          moduleName: schema.moduleName,
          entityName: schema.entityName,
          stageId: body.stageId,
        },
        { tracerParent: trace },
      );

      // validate creating a record
      await this.validateRecordTitleConstraintsWithBody(body, schema);

      // create a new record
      const dbRecord = new DbRecordEntity();
      dbRecord.organization = principal.organization;
      dbRecord.schema = schema;
      dbRecord.recordNumber = schema.isSequential ? `${recordNumberPrefix}${recordNumber}` : undefined;
      dbRecord.title = body.title;
      dbRecord.lastModifiedBy = principal;
      dbRecord.createdBy = principal;
      dbRecord.stage = stage;
      dbRecord.entity = `${schema.moduleName}:${schema.entityName}`;
      dbRecord.stageUpdatedAt = stage ? moment().utc().toDate() : undefined;

      //get user groups from id and add it to the records
      if(body.groups){
        dbRecord.groups = await this.dbRecordsRepository.findM2MLinks(body.groups)
      }

      // ODN-1201 set the record schemaType
      if(body.type && schema.types.length > 0) {
        // get the schema type or use the default

        let schemaType = schema.types.find(elem => elem.name === constantCase(body.type));

        // get the default if no body.type matches a schemaType
        if(!schemaType) {
          schemaType = schema.types ? schema.types.find(elem => elem.isDefault) : undefined;
        }

        dbRecord.schemaTypeId = schemaType.id;
        dbRecord.type = schemaType.name;

      }

      // validate properties from the request body before creating a dbRecord
      await this.validateBodyPropertiesBeforeDbRecordCreate(principal, schema.id, dbRecord.schemaTypeId, body)

      // When an externalId is passed in add the app and external Id to the record.
      if(body.externalId && !body.externalAppName) {

        throw new ExceptionType(422, 'an external connected app is required when using an external Id');

      } else if(body.externalAppName) {

        const orgAppRes = await this.amqpConnection.request<any>({
          exchange: IDENTITY_MODULE,
          routingKey: `${IDENTITY_MODULE}.${RPC_GET_ORG_APP_BY_NAME}`,
          payload: {
            principal,
            name: body.externalAppName,
          },
          timeout: 10000,
        });

        if(orgAppRes.successful) {

          dbRecord.externalApp = orgAppRes.data;
          dbRecord.externalId = body.externalId;

        } else {

          throw new ExceptionType(orgAppRes.statusCode, orgAppRes.message);

        }

      }

      // create a new record
      const newRecord: DbRecordEntity = await this.dbRecordsRepository.persist(dbRecord);

      // make the assignee the owner of the record
      // TODO move this to the notification module rabbitmq event listener
      await this.assignDbRecordToUser(principal, schema, newRecord, body);

      await this.updateOrCreateDbRecordColumns(
        principal,
        dbRecord,
        schema,
        body,
        { tracerParent: trace },
      );

      if(body.associations && body.associations.length > 0) {

        // publish message record created
        this.amqpConnection.publish(
          process.env.MODULE_NAME,
          `${process.env.MODULE_NAME}.${CREATE_DB_RECORD_ASSOCIATIONS}`,
          {
            principal: principal,
            id: newRecord.id,
            body: body.associations,
          },
        );
      }

      // log revision
      this.logsUserActivityService.createByPrincipal(principal, newRecord.id, body, LogsConstants.DB_RECORD_CREATED);

      // can be crossed.
      this.dbSearchService.reIndexSearchDatabaseForRecord(principal, newRecord.id, schema.id);

      if(shouldTriggerCreateEvent(body)) {
        // publish message record created
        this.amqpConnection.publish(
          process.env.MODULE_NAME,
          `${process.env.MODULE_NAME}.${schema.entityName}.${SUB_DB_RECORD_CREATED}`,
          {
            event: LogsConstants.DB_RECORD_CREATED,
            principal: principal,
            id: newRecord.id,
            body,
          },
        );
      }

      trace.finish();

      return { id: newRecord.id, entity: newRecord.entity };

    } catch (e) {

      console.error(e);
      throw new ExceptionType(e.statusCode, e.message, e.validation, e.data);

    }
  }

  /**
   * Verifies if the record schema has a required title or a unique title.
   * either would make the title required
   *
   * @param body
   * @param schema
   * @private
   */
  private async validateRecordTitleConstraintsWithBody(body: DbRecordCreateUpdateDto, schema: SchemaEntity) {

    if(schema.hasTitle && schema.isTitleRequired && !body.title) {
      throw new ExceptionType(
        400,
        'a title is required',
        DbRecordsPrincipalServiceInternal.createExceptionType('title', body.title, 'title is required'),
      );
    } else if(schema.hasTitle && schema.isTitleUnique && !body.title) {
      throw new ExceptionType(
        400,
        'a title is required',
        DbRecordsPrincipalServiceInternal.createExceptionType('title', body.title, 'title is unique, please add one'),
      );
    }

  }


  /**
   *
   * @param organization
   * @param params
   * @param options
   */
  public async _getDbRecordById(
    principal: OrganizationUserEntity,
    params: IGetDbRecordByIdParams,
    options?: IMethodOptions,
  ): Promise<DbRecordEntity> {

    const trace = await tracer.startSpan(
      '_getDbRecordById',
      { childOf: options && options.tracerParent ? options.tracerParent.context() : undefined },
    ).setTag('params', params);

    const { recordId } = params;

    const dbRecord = await this.dbRecordsRepository.getDbRecordByOrganizationAndId(principal, recordId);

    if(!dbRecord) {
      throw new ExceptionType(404, `could not locate db record with id ${recordId}`);
    }

    trace.finish();

    return dbRecord;
  }


  /**
   *
   * @param organization
   * @param params
   * @param options
   */
  public async _getDeletedDbRecordById(
    organization: OrganizationEntity,
    params: IGetDbRecordByIdParams,
    options?: IMethodOptions,
  ): Promise<DbRecordEntity> {

    const trace = await tracer.startSpan(
      '_getDeletedDbRecordById',
      { childOf: options && options.tracerParent ? options.tracerParent.context() : undefined },
    ).setTag('params', params);

    const { recordId } = params;

    const dbRecord = await this.dbRecordsRepository.getDeletedDbRecordByOrganizationAndId(organization, recordId);

    if(!dbRecord) {
      throw new ExceptionType(404, `could not locate db record with id ${recordId}`);
    }

    trace.finish();

    return dbRecord;
  }


  /**
   *
   * @param body
   */
  private static async validateCreateUpdateBody(body: DbRecordCreateUpdateDto) {
    try {
      const errors = await validate(body);
      if(errors.length > 0) {
        throw new ExceptionType(422, 'validation error', errors);
      }
    } catch (e) {
      console.error(e);
    }
  }

  /**
   *
   * @param principal
   * @param body
   * @param schema
   * @param options
   */
  private async checkIfRecordExists(
    principal: OrganizationUserEntity,
    body: DbRecordCreateUpdateDto,
    schema: SchemaEntity,
    options?: IMethodOptions,
  ): Promise<{ recordId: string }> {
    try {

      const trace = await tracer.startSpan(
        'checkIfRecordExists',
        { childOf: options && options.tracerParent ? options.tracerParent.context() : undefined },
      );

      let schemaTypeId;

      if(body.type) {
        const schemaType = schema.types.find(elem => elem.name === constantCase(body.type));
        schemaTypeId = schemaType ? schemaType.id : undefined;
      }

      // Filter all unique columns and the request body values
      const schemaColumns = await this.schemasColumnsService.getSchemaColumnsByOrganizationAndSchemaId(
        principal.organization,
        schema.id,
      );

      const uniqueColumns = await this.parseBodyForUniqueColumns(schemaColumns, schema, body);

      let recordId;

      if(body.externalId) {

        // If passing in an externalId this takes precedence over unique columns and or title
        const dbRecord = await this._getDbRecordByExternalId(
          principal,
          { externalId: body.externalId },
        );
        recordId = dbRecord ? dbRecord.id : undefined;

      } else if(uniqueColumns.length > 0) {

        const sanitizedTitle = ColumnValueUtilities.sanitizeDbRecordTitleForStorage(body.title);

        // try to find a record matching on unique columns
        const dbRecordId = await this._getDbRecordBySchemaAndValues(
          principal.organization,
          schema,
          uniqueColumns,
          schemaTypeId,
          sanitizedTitle,
        );

        recordId = !!dbRecordId ? dbRecordId['record_id'] : undefined;

      } else if(schema.hasTitle && schema.isTitleUnique) {
        // if the record only has a unique title and no unique columns then try to locate a record by title.
        recordId = await this.getDbRecordIdByOrganizationAndTitle(principal.organization, schema, schemaTypeId, body);

      }

      trace.finish();

      return { recordId };
    } catch (e) {
      console.error(e);
      throw new ExceptionType(e.statusCode, e.message, e.validation, e.data);
    }
  }

  /**
   *
   * @param organization
   * @param schema
   * @param schemaTypeId
   * @param body
   */
  private async getDbRecordIdByOrganizationAndTitle(
    organization: OrganizationEntity,
    schema: SchemaEntity,
    schemaTypeId: string,
    body: DbRecordCreateUpdateDto,
  ): Promise<string | undefined> {

    try {

      await this.validateRecordTitleConstraintsWithBody(body, schema);

      const sanitizedTitle = ColumnValueUtilities.sanitizeDbRecordTitleForStorage(body.title);

      const res = await this.dbRecordsRepository.findBySchemaAndTitle(
        organization,
        schema,
        schemaTypeId,
        sanitizedTitle,
      );

      if(res[0]) {

        return res[0] ? res[0].id : undefined;

      }

    } catch (e) {
      console.error(e);
      throw new ExceptionType(e.statusCode, e.message, e.validation, e.data);
    }
  }

  /**
   *
   * @param schemaColumns
   * @param schema
   * @param body
   */
  private parseBodyForUniqueColumns(
    schemaColumns: SchemaColumnEntity[],
    schema: SchemaEntity,
    body: DbRecordCreateUpdateDto,
  ) {
    try {

      if(!!body.properties) {

        const uniqueColumns: { id: string, value: string | number | boolean, type: string, name: string }[] = [];

        const bodyPropertyKeys = Object.keys(body.properties);

        let schemaType;

        if(body.type) {
          schemaType = schema.types.find(elem => elem.name === constantCase(body.type));
        }

        if(!schemaType) {

          schemaType = schema.types ? schema.types.find(elem => elem.isDefault) : undefined;

        }

        let uniqueSchemaColumns = schemaColumns
          .filter(elem => elem.validators
            .map(val => val.type)
            .includes(SchemaColumnValidatorTypes.UNIQUE.name),
          );

        // ODN-1201 - if there is a schemaType filter the columns by the type
        if(schemaType) {
          // we want to get schema types that are both matching the schemaTypeId and have no schemaTypeId (global
          // properties)
          uniqueSchemaColumns = schemaColumns
            .filter(elem => elem.validators
              .map(val => val.type)
              .includes(SchemaColumnValidatorTypes.UNIQUE.name)
              && (elem.schemaTypeId === schemaType.id || !elem.schemaTypeId),
            )
        }

        // check if body properties is missing a unique column
        for(const schemaCol of uniqueSchemaColumns) {

          if(!bodyPropertyKeys.includes(schemaCol.name)) {

            throw new ExceptionType(400, `missing unique column ${schemaCol.name}`);

          }

        }

        // match the body property with the unique schema column
        for(const property in body.properties) {

          const col = uniqueSchemaColumns.find(column => column.name == property);

          // build array of unique columns and values

          if(col) {

            // sanitize the data before checking
            const sanitizedValue = ColumnValueUtilities.sanitizeForStorage(
              body.properties,
              col,
              property,
            );

            uniqueColumns.push({
              id: col.id, value: sanitizedValue, type: col.type, name: col.name,
            });

          }
        }

        return uniqueColumns;
      } else {
        return [];
      }
    } catch (e) {
      console.error(e);
      throw new ExceptionType(e.statusCode, e.message);
    }
  }

  /**
   * handles the exception and validation message when a record should not be updated due to a
   * unique column conflict
   *
   * @param recordId
   * @param schema
   * @param title
   */
  private static throwRecordAlreadyExistsException(
    recordId: string,
    schema: SchemaEntity,
    title?: string,
  ) {
    const validationErrors = [];

    // if the title and schema title is unique add this validation
    if(schema.isTitleUnique && title) {
      const validationError = new ValidationError();
      validationError.property = 'title';
      validationError.value = title;
      validationError.constraints = {
        validatorType: SchemaColumnValidatorTypes.UNIQUE.name,
        columnType: 'TEXT',
      };

      validationErrors.push(validationError);
    }

    const messageUniqueTitle = 'conflict, record already exists with properties and title';
    const messageNoUniqueTitle = 'conflict, record already exists with properties';

    throw new ExceptionType(
      409,
      schema.isTitleUnique ? messageUniqueTitle : messageNoUniqueTitle,
      validationErrors,
      { entity: `${schema.moduleName}:${schema.entityName}`, id: recordId },
    );
  }

  /**
   *
   * @param principal
   * @param dbRecord
   * @param body
   * @private
   */
  private async assignDbRecordToUser(
    principal: OrganizationUserEntity,
    schema: SchemaEntity,
    dbRecord: DbRecordEntity,
    body: DbRecordCreateUpdateDto,
  ) {

    if(body.ownerId) {
      // Get the user by id from the identity module

      const getUserRes = await this.amqpConnection.request<any>({
        exchange: IDENTITY_MODULE,
        routingKey: `${IDENTITY_MODULE}.${RPC_GET_USER_BY_ID}`,
        payload: {
          principal,
          id: body.ownerId,
        },
        timeout: 10000,
      });

      if(getUserRes.successful) {
        dbRecord.ownedBy = getUserRes.data;
        const res = await this.dbRecordsRepository.persist(dbRecord);
        // publish new owner assigned
        this.amqpConnection.publish(
          NOTIFICATION_MODULE,
          `${NOTIFICATION_MODULE}.${SUB_DB_RECORD_OWNER_ASSIGNED}`,
          {
            event: 'DB_RECORD_OWNER_ASSIGNED',
            principal: principal,
            owner: getUserRes.data,
            id: res.id,
            schema: schema,
          },
        );
      }
    } else if(schema.recordDefaultOwnerId) {
      // Get the user by id from the identity module
      const getUserRes = await this.amqpConnection.request<any>({
        exchange: IDENTITY_MODULE,
        routingKey: `${IDENTITY_MODULE}.${RPC_GET_USER_BY_ID}`,
        payload: {
          principal,
          id: schema.recordDefaultOwnerId,
        },
        timeout: 10000,
      });

      if(getUserRes.successful) {
        dbRecord.ownedBy = getUserRes.data;
        const res = await this.dbRecordsRepository.persist(dbRecord);
        // publish new owner assigned
        this.amqpConnection.publish(
          NOTIFICATION_MODULE,
          `${NOTIFICATION_MODULE}.${SUB_DB_RECORD_OWNER_ASSIGNED}`,
          {
            event: 'DB_RECORD_OWNER_ASSIGNED',
            principal: principal,
            owner: getUserRes.data,
            id: res.id,
            schema: schema,
          },
        );
      }
    }
  }

  /**
   * Checks if the record has changed
   * @param dbRecord
   * @param body
   * @private
   */
  private isRecordDiff(dbRecord: DbRecordEntity, body: DbRecordCreateUpdateDto) {

    if(body.recordNumber && dbRecord.recordNumber !== body.recordNumber) {

      return true;

    }

    if(body.externalId && dbRecord.externalId !== body.externalId) {

      return true;

    }

    if(body.title && dbRecord.title !== body.title) {

      return true;

    }

    if(body.stageId && dbRecord.stage) {

      if(body.stageId !== dbRecord.stage.id) {

        return true;

      }

    } else if(body.stageId && !dbRecord.stage) {

      return true

    }

    if(body.ownerId && dbRecord.ownedBy) {

      if(body.ownerId !== dbRecord.ownedBy.id) {

        return true;

      }

    } else if(body.ownerId && !dbRecord.ownedBy) {

      return true

    }

    return false;

  }

  /**
   * check id the record schema is different
   * @param dbRecord
   * @param schema
   * @private
   */
  private isSchemaDiff(dbRecord: DbRecordEntity, schema: SchemaEntity) {

    if(schema.id !== dbRecord.schemaId) {

      return true

    }

    return false;

  }

  /**
   *
   * @param property
   * @param value
   * @param constraint
   * @private
   */
  private static createExceptionType(property: string, value: string, constraint: string): ValidationError[] {
    const validationError = new ValidationError();
    validationError.property = property;
    validationError.value = value;
    validationError.constraints = {
      constraint,
    };
    return [ validationError ];
  }

}
