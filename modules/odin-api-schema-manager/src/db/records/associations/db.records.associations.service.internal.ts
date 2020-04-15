import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { tracer } from '@d19n/common/dist/logging/Tracer';
import { OrganizationEntity } from '@d19n/models/dist/identity/organization/organization.entity';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { LogsConstants } from '@d19n/models/dist/logs/logs.constants';
import {
  SUB_DB_RECORD_ASSOCIATION_CREATED,
  SUB_DB_RECORD_ASSOCIATION_DELETED,
  SUB_DB_RECORD_ASSOCIATION_UPDATED,
} from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import { DbRecordAssociationColumnEntityTransform } from '@d19n/models/dist/schema-manager/db/record/association-column/transform/db.record.association.column.entity.transform';
import { DbRecordAssociationEntity } from '@d19n/models/dist/schema-manager/db/record/association/db.record.association.entity';
import { DbRecordAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/association/dto/db.record.association.create.update.dto';
import { DbRecordAssociationRecordsTransform } from '@d19n/models/dist/schema-manager/db/record/association/transform/db.record.association.records.transform';
import { RelationTypeEnum } from '@d19n/models/dist/schema-manager/db/record/association/types/db.record.association.constants';
import { DbRecordEntity } from '@d19n/models/dist/schema-manager/db/record/db.record.entity';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { SchemaAssociationEntity } from '@d19n/models/dist/schema-manager/schema/association/schema.association.entity';
import { SchemaAssociationEntityTransform } from '@d19n/models/dist/schema-manager/schema/association/transform/schema.association.entity.transform';
import { SchemaAssociationCardinalityTypes } from '@d19n/models/dist/schema-manager/schema/association/types/schema.association.cardinality.types';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SchemaEntityTransform } from '@d19n/models/dist/schema-manager/schema/transform/schema.entity.transform';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult } from 'typeorm';
import { IsJsonString } from '../../../helpers/ValidateDBRecordColumnValues';
import { LogsUserActivityService } from '../../../logs/user-activity/logs.user.activity.service';
import { SchemasAssociationsService } from '../../../schemas/associations/schemas.associations.service';
import { SchemasColumnsService } from '../../../schemas/columns/schemas.columns.service';
import { SchemasService } from '../../../schemas/schemas.service';
import { DbService } from '../../db.service';
import {
  IAddAssociationColumnParams,
  ICreateDbRecordAssociations,
  IGetDbRecordAssociation,
  IGetDbRecordAssociationByContext,
  IGetDbRecordAssociationBySchema,
  IGetDbRecordAssociationChildRecordIds,
  IGetDbRecordAssociationParentRecordIds,
  IGetRecordsWithColumnMappingParams,
  IMergeColumnsWithAssociationMappingParams,
  IMethodOptions,
  IUpdateDbRecordAssociation,
} from '../../interfaces/interfaces';
import { DbSearchService } from '../../search/db.search.service';
import { DbRecordAssociationsColumnsRepository } from '../associations-columns/db.records.associations.columns.repository';
import { DbRecordsAssociationsColumnsService } from '../associations-columns/db.records.associations.columns.service';
import { DbRecordsService } from '../db.records.service';
import { DbRecordsAssociationsRepository } from './db.records.associations.repository';

export class DbRecordAssociationDeleteResult {
  @ApiProperty()
  public affected: number;

  @ApiProperty()
  public dbRecordAssociation: DbRecordAssociationEntity;
}

interface RelatedRecordAssociationsByOrganizationAndParam {
  organization: OrganizationEntity;
  params: IGetDbRecordAssociation;
  options?: IMethodOptions;
}

interface RelatedRecordByOrganizationAndParams {
  organization: OrganizationEntity;
  params: IGetDbRecordAssociation;
  options?: IMethodOptions;
}

@Injectable()
export class DbRecordsAssociationsServiceInternal extends DbRecordsAssociationsColumnsService {

  protected readonly schemasColumnsService: SchemasColumnsService;
  protected readonly logsUserActivityService: LogsUserActivityService;

  private readonly dbRecordAssociationRepository: DbRecordsAssociationsRepository;
  private readonly schemasService: SchemasService;
  private readonly schemasAssociationsService: SchemasAssociationsService;
  private readonly dbService: DbService;
  private readonly dbRecordsService: DbRecordsService;
  private readonly dbSearchService: DbSearchService;
  private readonly amqpConnection: AmqpConnection;

  public constructor(
    @InjectRepository(DbRecordAssociationsColumnsRepository) dbRecordAssociationsColumnsRepository: DbRecordAssociationsColumnsRepository,
    @InjectRepository(DbRecordsAssociationsRepository) dbRecordAssociationRepository: DbRecordsAssociationsRepository,
    @Inject(forwardRef(() => DbRecordsService)) dbRecordsService: DbRecordsService,
    @Inject(forwardRef(() => DbService)) dbService: DbService,
    @Inject(forwardRef(() => DbSearchService)) dbSearchService: DbSearchService,
    @Inject(forwardRef(() => SchemasAssociationsService)) schemasAssociationsService: SchemasAssociationsService,
    @Inject(forwardRef(() => LogsUserActivityService)) logsUserActivityService: LogsUserActivityService,
    schemasService: SchemasService,
    schemasColumnsService: SchemasColumnsService,
    amqpConnection: AmqpConnection,
  ) {

    super(dbRecordAssociationsColumnsRepository, logsUserActivityService, schemasColumnsService);

    this.dbRecordAssociationRepository = dbRecordAssociationRepository;
    this.logsUserActivityService = logsUserActivityService;
    this.dbRecordsService = dbRecordsService;
    this.dbService = dbService;
    this.schemasAssociationsService = schemasAssociationsService;
    this.dbSearchService = dbSearchService;
    this.schemasService = schemasService;
    this.amqpConnection = amqpConnection;
  }

  //================================================================================
  // Get data
  //================================================================================

  /**
   * Returns a DbRecord detail with any associated columns merged
   * And any related records specified in the entities param
   *
   * This is when you want to view a single record that has
   * column mappings enabled for the relationship.
   *
   * @param organization
   * @param params
   * @param options
   */
  async _getRelatedRecordById({ organization, params, options }: RelatedRecordByOrganizationAndParams): Promise<DbRecordEntityTransform> {
    try {

      const trace = await tracer.startSpan(
        '_getRelatedRecordById',
        { childOf: options && options.tracerParent ? options.tracerParent.context() : undefined },
      ).setTag('params', params);

      const { recordId, dbRecordAssociationId, entities } = params;
      // Get the record
      const record = await this.dbRecordsService.getDbRecordById(organization, recordId, { tracerParent: trace });
      const schema = await this.schemasService.getSchemaByOrganizationAndId(
        organization,
        { schemaId: record.schemaId },
      );
      // Get the record association
      const dbRecordAssociation = await this.dbRecordAssociationRepository.getByOrganizationAndId(
        organization,
        dbRecordAssociationId,
      );

      // Transform the Record
      let transformed = DbRecordEntityTransform.transform(
        record,
        schema,
        undefined,
        dbRecordAssociation,
      );

      transformed.schemaAssociationId = dbRecordAssociation['schemaAssociationId'];

      transformed = await this.addAssociationColumns(
        organization,
        { dbRecordAssociation, transformed, record },
        { tracerParent: trace },
      );

      const associations = await this._getRelatedRecordsByEntity(
        organization,
        {
          recordId,
          entities,
          dbRecordAssociationId,
        },
        { tracerParent: trace },
      );

      return Object.assign({}, transformed, associations);

    } catch (e) {
      console.error(e);
      throw new ExceptionType(e.statusCode, e.message);
    }
  }


  /**
   * Returns record associations list
   * used when we just need to get associations for a record
   * @param organization
   * @param params
   * @param options
   */
  async _getRelatedRecordsByEntity(
    organization,
    params,
    options,
  ): Promise<{ [key: string]: DbRecordAssociationRecordsTransform }> {
    try {

      const { entities, recordId, dbRecordAssociationId, filters } = params;

      let schemaAssociations: SchemaAssociationEntity[];

      if(entities) {

        const trace = await tracer.startSpan(
          '_getRelatedRecordsByEntity',
          { childOf: options && options.tracerParent ? options.tracerParent.context() : undefined },
        );

        // get the record
        const dbRecord = await this.dbRecordsService.getDbRecordById(organization, recordId, { tracerParent: trace });

        // We need to load the full schema associations (parent & child)
        const res = await this.schemasService.getSchemaByOrganizationAndIdWithAssociations(
          organization,
          { schemaId: dbRecord.schemaId },
          { tracerParent: trace },
        );
        schemaAssociations = res.associations;

        const parentRelations = await this.getRelatedParentRecords(
          organization,
          {
            recordId,
            entities,
            associations: schemaAssociations,
            dbRecordAssociationId,
            filters,
          },
          { tracerParent: trace },
        );

        const childRelations = await this.getRelatedChildRecords(
          organization,
          {
            recordId,
            entities,
            associations: schemaAssociations,
            dbRecordAssociationId,
            filters,
          },
          { tracerParent: trace },
        );

        console.log('parentRelations', parentRelations);
        console.log('childRelations', childRelations);

        trace.finish();

        // Group all records by entity
        return this.addRecordAssociationsToRecord([
          ...childRelations,
          ...parentRelations,
        ]);
      }

    } catch (e) {
      console.error(e);
      throw new ExceptionType(500, e.message);
    }
  }


  /**
   *
   * @param organization
   * @param params
   * @param options
   */
  private async getRelatedParentRecords(
    organization: OrganizationEntity,
    params: IGetDbRecordAssociation,
    options?: IMethodOptions,
  ) {

    const trace = await tracer.startSpan(
      'getRelatedParentRecords',
      { childOf: options && options.tracerParent ? options.tracerParent.context() : undefined },
    ).setTag('params', params);

    const { associations, entities, recordId, dbRecordAssociationId, filters } = params;

    const parentRelations = [];

    let parseEntities = entities;
    if(typeof entities === 'string') {

      if(!IsJsonString(entities)) {
        throw new ExceptionType(400, 'entities is not valid JSON');
      }

      parseEntities = entities ? JSON.parse(entities) : [];
    }

    const parentAssociations = associations.filter(elem => elem.parentSchema && parseEntities.includes(elem.parentSchema.entityName));

    for(const parentAssociation of parentAssociations) {

      let relatedRecords;

      const transformed = SchemaAssociationEntityTransform.transform(parentAssociation);
      transformed.relationType = RelationTypeEnum.PARENT;

      const parentRecordIds = await this.getRelatedRecordIds(
        organization,
        filters,
        recordId,
        entities,
        parentAssociation,
        dbRecordAssociationId,
        RelationTypeEnum.PARENT,
        trace,
      );

      // Using the ids get the records
      relatedRecords = await this.dbRecordsService.getManyDbRecordsByIds(
        organization,
        {
          recordIds: parentRecordIds,
        },
        {
          tracerParent: trace,
        },
      );

      if(relatedRecords && relatedRecords.length > 0) {

        relatedRecords = await this.buildRecordWithAssociatedColumnsAndTransform(
          organization,
          {
            recordId,
            relatedRecords,
            schema: parentAssociation.parentSchema,
            schemaAssociation: transformed,
          },
          {
            tracerParent: trace,
          },
        );

      }

      const recordAssociation = new DbRecordAssociationRecordsTransform();
      recordAssociation.schema = SchemaEntityTransform.transform(parentAssociation.parentSchema);
      recordAssociation.schemaAssociation = transformed;
      recordAssociation.dbRecords = relatedRecords;

      // remove properties we do not want to return
      delete recordAssociation.schemaAssociation.parentSchema;

      parentRelations.push(recordAssociation);
    }

    trace.finish();

    return parentRelations;
  }


  /**
   *
   * @param organization
   * @param params
   * @param options
   */
  private async getRelatedChildRecords(
    organization: OrganizationEntity,
    params: IGetDbRecordAssociation,
    options?: IMethodOptions,
  ) {

    const { associations, entities, recordId, dbRecordAssociationId, filters } = params;

    const trace = await tracer.startSpan(
      'getRelatedChildRecords',
      { childOf: options && options.tracerParent ? options.tracerParent.context() : undefined },
    ).setTag('params', params);

    const childRelations = [];

    let parseEntities = entities;

    if(typeof entities === 'string') {

      if(!IsJsonString(entities)) {
        throw new ExceptionType(400, 'entities is not valid JSON');
      }

      parseEntities = entities ? JSON.parse(entities) : [];

    }

    const childAssociations = associations.filter(elem => elem.childSchema && parseEntities.includes(elem.childSchema.entityName));

    for(const childAssociation of childAssociations) {

      let relatedRecords;

      const transformed = SchemaAssociationEntityTransform.transform(childAssociation);
      transformed.relationType = RelationTypeEnum.CHILD;

      // get related record ids
      const childRecordIds = await this.getRelatedRecordIds(
        organization,
        filters,
        recordId,
        entities,
        childAssociation,
        dbRecordAssociationId,
        RelationTypeEnum.CHILD,
        trace,
      );

      // Get the records by recordIds
      relatedRecords = await this.dbRecordsService.getManyDbRecordsByIds(
        organization,
        {
          recordIds: childRecordIds,
        },
        {
          tracerParent: trace,
        },
      );

      if(relatedRecords && relatedRecords.length > 0) {
        relatedRecords = await this.buildRecordWithAssociatedColumnsAndTransform(
          organization,
          {
            recordId,
            relatedRecords,
            schema: childAssociation.childSchema,
            schemaAssociation: transformed,
          },
          {
            tracerParent: trace,
          },
        );
      }

      const recordAssociation = new DbRecordAssociationRecordsTransform();
      recordAssociation.schema = SchemaEntityTransform.transform(childAssociation.childSchema);
      recordAssociation.schemaAssociation = transformed;
      recordAssociation.dbRecords = relatedRecords;

      // remove properties we do not want to return
      delete recordAssociation.schemaAssociation.childSchema;

      childRelations.push(recordAssociation);
    }

    trace.finish();

    return childRelations;
  }

  /**
   *
   * @param filters
   * @param organization
   * @param recordId
   * @param entities
   * @param trace
   * @param schemaAssociation
   * @param dbRecordAssociationId
   * @param relationType
   * @private
   */
  private async getRelatedRecordIds(
    organization: OrganizationEntity,
    filters: string[],
    recordId: string,
    entities: string[],
    schemaAssociation: SchemaAssociationEntity,
    dbRecordAssociationId: string,
    relationType: RelationTypeEnum,
    trace: any,
  ) {

    let recordIds = [];

    if(filters) {
      if(relationType === RelationTypeEnum.PARENT) {
        // get parent records ids with filters applied
        recordIds = await this.dbRecordAssociationRepository.getRelatedParentRecordIdsFiltered(
          organization,
          {
            recordId,
            entities,
            filters,
          },
          {
            tracerParent: trace,
          },
        );
      } else if(relationType === RelationTypeEnum.CHILD) {
        // get child records ids with filters applied
        // get all child record ids after applying any filters
        recordIds = await this.dbRecordAssociationRepository.getRelatedChildRecordIdsFiltered(
          organization,
          {
            recordId,
            entities,
            filters,
          },
          {
            tracerParent: trace,
          },
        );
      }

    } else {
      if(relationType === RelationTypeEnum.PARENT) {
        // get all parent records ids
        recordIds = await this._getRelatedParentRecordIds(
          organization,
          {
            recordId: recordId,
            parentSchemaId: schemaAssociation.parentSchemaId,
            relatedAssociationId: dbRecordAssociationId,
          },
          {
            tracerParent: trace,
          },
        );
      } else if(relationType === RelationTypeEnum.CHILD) {
        // get all child record ids
        recordIds = await this._getRelatedChildRecordIds(
          organization,
          {
            recordId: recordId,
            childSchemaId: schemaAssociation.childSchemaId,
            relatedAssociationId: dbRecordAssociationId,
          },
          {
            tracerParent: trace,
          },
        );
      }
    }

    return recordIds;

  }

  /**
   *
   * @param organization
   * @param params
   * @param options
   */
  async _getRelatedChildRecordIds(
    organization: OrganizationEntity,
    params: IGetDbRecordAssociationChildRecordIds,
    options?: IMethodOptions,
  ): Promise<string[]> {
    try {

      const trace = await tracer.startSpan(
        'getChildRecordIdsByOrganizationRecordIdAndChildSchemaId',
        { childOf: options && options.tracerParent ? options.tracerParent.context() : undefined },
      ).setTag('params', params);

      const res = await this.dbRecordAssociationRepository.getChildRecordIdsByOrganizationRecordIdAndChildSchemaId(
        organization,
        {
          recordId: params.recordId,
          childSchemaId: params.childSchemaId,
          relatedAssociationId: params.relatedAssociationId,
        },
        options,
      );

      trace.finish();

      return res;

    } catch (e) {
      console.error(e);
    }
  }

  /**
   *
   * @param organization
   * @param params
   * @param options
   */
  async _getRelatedParentRecordIds(
    organization: OrganizationEntity,
    params: IGetDbRecordAssociationParentRecordIds,
    options?: IMethodOptions,
  ): Promise<string[]> {

    const trace = await tracer.startSpan(
      '_getRelatedParentRecordIds',
      { childOf: options && options.tracerParent ? options.tracerParent.context() : undefined },
    ).setTag('params', params);

    const res = await this.dbRecordAssociationRepository.getParentRecordIdsByOrganizationRecordIdAndParentSchemaId(
      organization,
      {
        recordId: params.recordId,
        parentSchemaId: params.parentSchemaId,
        relatedAssociationId: params.relatedAssociationId,
      },
      options,
    );

    trace.finish();

    return res;

    try {
    } catch (e) {
      console.error(e);
    }
  }

  /**
   *
   * @param organization
   * @param params
   * @param options
   */
  private async getDbRecordAssociationByContext(
    organization: OrganizationEntity,
    params: IGetDbRecordAssociationByContext,
    options?: IMethodOptions,
  ): Promise<DbRecordAssociationEntity> {

    const trace = await tracer.startSpan(
      'getDbRecordAssociationByContext',
      { childOf: options && options.tracerParent ? options.tracerParent.context() : undefined },
    ).setTag('params', params);

    const { isParentCtx, sourceRecordId, targetRecord } = params;

    const dbRecordAssociation = await this.dbRecordAssociationRepository.getByParentRecordIdAndChildRecordId(
      organization,
      isParentCtx ? sourceRecordId : targetRecord.id,
      isParentCtx ? targetRecord.id : sourceRecordId,
    );

    trace.finish();

    return dbRecordAssociation;

  }

  /**
   * @param organization
   * @param params
   * @param options
   */
  async _lookUpRecordIdsAcrossRelations(
    organization: OrganizationEntity,
    params: IGetDbRecordAssociationBySchema,
    options?: IMethodOptions,
  ): Promise<string[]> {
    try {

      const trace = await tracer.startSpan(
        '_lookUpRecordIdsAcrossRelations',
        { childOf: options && options.tracerParent ? options.tracerParent.context() : undefined },
      ).setTag('params', params);

      const { recordId, findInSchema, findInChildSchema } = params;

      let primaryIds: string[] = [];
      let nestedIds: string[] = [];

      // If there is no childSchema to lookUp
      if(findInSchema && !findInChildSchema) {

        primaryIds = await this.lookUpRelatedRecordIdsBySchemaId(organization, [ recordId ], findInSchema);
      }


      if(findInSchema && findInChildSchema) {

        const primaryIds = await this.lookUpRelatedRecordIdsBySchemaId(organization, [ recordId ], findInSchema);

        nestedIds = await this.lookUpRelatedRecordIdsBySchemaId(organization, primaryIds, findInChildSchema);

      }

      trace.finish();

      return [ ...primaryIds, ...nestedIds ];


    } catch (e) {
      throw new ExceptionType(500, e.message);
    }
  }

  private async lookUpRelatedRecordIdsBySchemaId(
    organization: OrganizationEntity,
    recordIds: string[],
    findInSchema: string,
  ) {
    // returns the relations by schemaId ( parent | child )
    const ids = [];
    if(recordIds && recordIds.length > 0) {
      const parentIds = await this.dbRecordAssociationRepository.getParentRecordIdsByOrganizationRecordIdAndParentSchemaId(
        organization,
        {
          recordId: undefined,
          recordIds,
          parentSchemaId: findInSchema,
          relatedAssociationId: undefined,
        },
      );

      ids.push(...parentIds);

      const childIds = await this.dbRecordAssociationRepository.getChildRecordIdsByOrganizationRecordIdAndChildSchemaId(
        organization,
        {
          recordId: undefined,
          recordIds,
          childSchemaId: findInSchema,
          relatedAssociationId: undefined,
        },
      );

      ids.push(...childIds);
    }

    return ids;
  }

  /**
   *
   * @param organization
   * @param parentRecordId
   * @param childRecordId
   */
  public async _getRelatedRecordByParentAndChildId(
    organization: OrganizationEntity,
    parentRecordId: string,
    childRecordId: string,
  ): Promise<DbRecordAssociationEntity> {
    try {
      return await this.dbRecordAssociationRepository.getByParentRecordIdAndChildRecordId(
        organization,
        parentRecordId,
        childRecordId,
      );
    } catch (e) {
      throw new ExceptionType(e.statusCode, e.message)
    }
  }


  //================================================================================
  // Create data
  //================================================================================

  /**
   * this method will create associations for a recordId
   * to all the association ids (parent or child)
   *
   * @param principal
   * @param params
   * @param options
   */
  public async _createRelatedRecords(
    principal: OrganizationUserEntity,
    params: ICreateDbRecordAssociations,
    options?: IMethodOptions,
  ): Promise<DbRecordAssociationEntity[]> {
    try {

      const trace = await tracer.startSpan(
        'createDbRecordAssociationsFromRecordIds',
        { childOf: options && options.tracerParent ? options.tracerParent.context() : undefined },
      );

      const { recordId, body } = params;

      // Check that we have associations to create
      if(!body) {
        return;
      } else if(body && body.length < 1) {
        return;
      }

      // get the record
      const dbRecord = await this.dbRecordsService.getDbRecordById(
        principal.organization,
        recordId,
        { tracerParent: trace },
      );

      // get all records excluding the source record id
      const dbRecords: DbRecordEntity[] = await this.dbRecordsService.getManyDbRecordsByIds(
        principal.organization,
        {
          recordIds: body.filter(elem => elem.recordId).map(elem => elem.recordId),
        },
        {
          tracerParent: trace,
        },
      );

      const {
        childSchemaAssociations,
        parentSchemaAssociations,
      } = await this.getSchemaAssociationsByPrincipalAndSchemaId(principal, dbRecord.schemaId);

      const batchProcess: DbRecordAssociationEntity[] = [];

      if(dbRecords) {

        for(const relatedRecord of dbRecords) {
          // match records and create child associations
          const { childSchemaAssociation, parentSchemaAssociation } = await this.matchRecordWithSchemaAssociation(
            relatedRecord,
            childSchemaAssociations,
            parentSchemaAssociations,
          );

          // find the association from the request body so we can get any additional
          // data passed in
          const association = body.find(elem => elem.recordId === relatedRecord.id);

          // get the related association if there is one
          let relatedAssociation;
          if(!!association.relatedAssociationId) {

            relatedAssociation = await this.dbRecordAssociationRepository.getByOrganizationAndId(
              principal.organization,
              association.relatedAssociationId,
            );
          }

          let shouldCreateChildAssociation = await this.shouldCreateChildAssociation(
            principal,
            childSchemaAssociation,
            recordId,
            relatedRecord,
          );

          let shouldCreateParentAssociation = await this.shouldCreateParentAssociation(
            principal,
            parentSchemaAssociation,
            recordId,
            relatedRecord,
          );

          console.log('shouldCreateChildAssociation_before', shouldCreateChildAssociation);
          console.log('shouldCreateParentAssociation_before', shouldCreateParentAssociation);

          // This is for records that have a self relation
          if(shouldCreateChildAssociation && shouldCreateParentAssociation) {
            // ensure the relation type is in constantCase
            let relationType = association.relationType ? association.relationType.toLowerCase() : null;

            if(!relationType) {
              throw new ExceptionType(400, 'Please set the relationType: PARENT | CHILD for self-relations')
            }
            // if the relating record is a child we want to create a child relation
            shouldCreateChildAssociation = relationType == RelationTypeEnum.CHILD;
            // if the relating record is a parent we want to create a parent relation
            shouldCreateParentAssociation = relationType == RelationTypeEnum.PARENT;
          }

          console.log('shouldCreateChildAssociation_after', shouldCreateChildAssociation);
          console.log('shouldCreateParentAssociation_after', shouldCreateParentAssociation);

          if(shouldCreateChildAssociation) {

            const create: DbRecordAssociationEntity = new DbRecordAssociationEntity();
            create.organization = principal.organization;
            create.createdBy = principal;
            create.lastModifiedBy = principal;
            create.relatedAssociation = relatedAssociation;
            create.schemaAssociationId = childSchemaAssociation.id;
            create.parentSchemaId = childSchemaAssociation.parentSchemaId;
            create.parentRecord = dbRecord;
            create.childSchemaId = childSchemaAssociation.childSchemaId;
            create.childRecord = relatedRecord;

            batchProcess.push(create);

          } else if(shouldCreateParentAssociation) {

            const create: DbRecordAssociationEntity = new DbRecordAssociationEntity();
            create.organization = principal.organization;
            create.createdBy = principal;
            create.lastModifiedBy = principal;
            create.relatedAssociation = relatedAssociation;
            create.schemaAssociationId = parentSchemaAssociation.id;
            create.parentSchemaId = parentSchemaAssociation.parentSchemaId;
            create.parentRecord = relatedRecord;
            create.childSchemaId = parentSchemaAssociation.childSchemaId;
            create.childRecord = dbRecord;

            batchProcess.push(create);
          }
        }

        const created = await this.createOneOrManyDbRecordAssociations(principal, batchProcess);

        trace.finish();

        return created;

      }

      return [];

    } catch (e) {
      console.error(e);
      throw new ExceptionType(e.statusCode, e.message);
    }
  }

  /**
   *
   * @param principal
   * @param associationsToCreate
   */
  private async createOneOrManyDbRecordAssociations(
    principal: OrganizationUserEntity,
    associationsToCreate: any[],
  ): Promise<DbRecordAssociationEntity[]> {

    if(associationsToCreate.length > 0) {

      const values = [];
      for(const elem of associationsToCreate) {

        if(elem.relatedAssociation) {
          values.push(`('${elem.organization.id}', '${elem.schemaAssociationId}', '${elem.parentSchemaId}', '${elem.parentRecord.id}', '${elem.childSchemaId}', '${elem.childRecord.id}', '${elem.relatedAssociation.id}', '${elem.createdBy.id}', '${elem.lastModifiedBy.id}', '${elem.parentRecord.entity}', '${elem.childRecord.entity}')`);
        } else {

          values.push(`('${elem.organization.id}', '${elem.schemaAssociationId}', '${elem.parentSchemaId}', '${elem.parentRecord.id}', '${elem.childSchemaId}', '${elem.childRecord.id}', NULL, '${elem.createdBy.id}', '${elem.lastModifiedBy.id}', '${elem.parentRecord.entity}', '${elem.childRecord.entity}')`);
        }

      }

      const creates = await this.dbRecordAssociationRepository.query(`
        INSERT INTO db_records_associations (organization_id, schema_association_id, parent_schema_id, parent_record_id, child_schema_id, child_record_id, related_association_id, created_by_id, last_modified_by_id, parent_entity, child_entity) 
        VALUES ${values} RETURNING id, parent_record_id, parent_schema_id, parent_entity, child_record_id, child_schema_id, child_entity, related_association_id, schema_association_id;
        `);

      const items = [];
      for(const item of creates) {

        let dbRecordAssociation: DbRecordAssociationEntity = undefined;
        dbRecordAssociation = new DbRecordAssociationEntity();
        dbRecordAssociation.id = item.id;
        dbRecordAssociation.childRecordId = item.child_record_id;
        dbRecordAssociation.childSchemaId = item.child_schema_id;
        dbRecordAssociation.parentRecordId = item.parent_record_id;
        dbRecordAssociation.parentSchemaId = item.parent_schema_id;
        dbRecordAssociation.parentEntity = item.parent_entity;
        dbRecordAssociation.childEntity = item.child_entity;
        dbRecordAssociation.relatedAssociationId = item.related_association_id;

        items.push(dbRecordAssociation);

        await this.amqpConnection.publish(
          process.env.MODULE_NAME,
          `${process.env.MODULE_NAME}.${SUB_DB_RECORD_ASSOCIATION_CREATED}`,
          {
            event: LogsConstants.DB_RECORD_ASSOCIATION_CREATED,
            principal,
            dbRecordAssociation,
          },
        );
      }

      this.clearCacheAndLogUserEvent(principal, items, LogsConstants.DB_RECORD_ASSOCIATION_CREATED);

      return items;

    } else {
      return [];
    }
  }


  /**
   *
   * @param principal
   * @param params
   * @param options
   */
  async _updateRelatedRecordById(
    principal: OrganizationUserEntity,
    params: IUpdateDbRecordAssociation,
    options?: IMethodOptions,
  ): Promise<DbRecordAssociationEntity> {
    try {

      const { recordId, dbRecordAssociationId, body } = params;

      const dbRecordAssociation: DbRecordAssociationEntity = await this.dbRecordAssociationRepository.getByOrganizationAndIdWithRelations(
        principal.organization,
        dbRecordAssociationId,
      );

      if(!dbRecordAssociation) {
        throw new ExceptionType(404, 'db record association not found', null, {
          dbRecordAssociation,
          body,
        });
      }

      dbRecordAssociation.lastModifiedBy = principal;

      const dbRecord = await this.dbRecordsService.getDbRecordById(principal.organization, recordId);
      const schema = await this.schemasService.getSchemaByOrganizationAndId(
        principal.organization,
        { schemaId: dbRecord.schemaId },
      );

      // Update db.record.association.columns table
      await this.updateOrCreateDbRecordAssociationColumns(
        principal,
        dbRecordAssociation,
        dbRecord,
        schema,
        body,
      );

      const res: DbRecordAssociationEntity = await this.dbRecordAssociationRepository.save(dbRecordAssociation);

      await this.amqpConnection.publish(
        process.env.MODULE_NAME,
        `${process.env.MODULE_NAME}.${SUB_DB_RECORD_ASSOCIATION_UPDATED}`,
        {
          event: LogsConstants.DB_RECORD_ASSOCIATION_UPDATED,
          principal,
          dbRecordAssociation: res,
        },
      );

      this.clearCacheAndLogUserEvent(principal, [ res ], LogsConstants.DB_RECORD_ASSOCIATION_UPDATED);

      return res;
    } catch (e) {
      throw new ExceptionType(e.statusCode, e.message);
    }
  }


  //================================================================================
  // Delete data
  //================================================================================


  /**
   * deletes many db record associations from a string of comma separated ids
   * id1,id2,id3,id4...
   * @param principal
   * @param ids = association ids
   *
   */
  async _deleteManyByAssociationIds(
    principal: OrganizationUserEntity,
    ids: string,
  ): Promise<DbRecordAssociationDeleteResult[]> {

    // TODO: Limit to 200
    const idsArray = ids.split(',');
    try {

      const deleteResults: DbRecordAssociationDeleteResult[] = [];

      for(const id of idsArray) {
        const res = await this._deleteByAssociationId(principal, id);
        await this.amqpConnection.publish(
          process.env.MODULE_NAME,
          `${process.env.MODULE_NAME}.${SUB_DB_RECORD_ASSOCIATION_DELETED}`,
          {
            event: LogsConstants.DB_RECORD_ASSOCIATION_DELETED,
            principal,
            dbRecordAssociation: res.dbRecordAssociation,
            affected: res.affected,
          },
        );
        deleteResults.push(res);
      }

      return deleteResults;

    } catch (e) {
      throw new ExceptionType(e.statusCode, e.message);
    }
  }

  /**
   * Deletes all db record associations parent or child to the record
   * being deleted will be deleted
   * @param principal
   * @param dbRecordId
   * @param options
   *
   */
  async _deleteByRecordId(
    principal: OrganizationUserEntity,
    dbRecordId: string,
    options?: IMethodOptions,
  ): Promise<DbRecordAssociationDeleteResult[]> {
    try {
      const deleteResults: DbRecordAssociationDeleteResult[] = [];

      const records = await this.dbRecordAssociationRepository.query(`
      SELECT id FROM db_records_associations 
      WHERE organization_id = '${principal.organization.id}'
      AND (parent_record_id = '${dbRecordId}' OR child_record_id = '${dbRecordId}') 
      AND deleted_at IS NULL;`);

      if(records && records[0]) {

        // soft delete all the db record associations
        for(const record of records) {
          const res = await this._deleteByAssociationId(principal, record.id);

          await this.amqpConnection.publish(
            process.env.MODULE_NAME,
            `${process.env.MODULE_NAME}.${SUB_DB_RECORD_ASSOCIATION_DELETED}`,
            {
              event: LogsConstants.DB_RECORD_ASSOCIATION_DELETED,
              principal,
              dbRecordAssociation: res.dbRecordAssociation,
              affected: res.affected,
            },
          );
          deleteResults.push(res);
        }

        // soft delete db record association columns
        await this.softDeleteAssociationColumnsByRecordId(principal, dbRecordId);
      }

      return deleteResults;
    } catch (e) {
      throw new ExceptionType(e.statusCode, e.message);
    }
  }


  /**
   *
   * @param principal
   * @param dbRecordAssociationId
   *
   */
  async _deleteByAssociationId(
    principal: OrganizationUserEntity,
    dbRecordAssociationId: string,
  ): Promise<DbRecordAssociationDeleteResult> {
    try {

      const dbRecordAssociation = await this.dbRecordAssociationRepository.getByOrganizationAndIdWithRelations(
        principal.organization,
        dbRecordAssociationId,
      );

      const deleteResult: DeleteResult = await this.dbRecordAssociationRepository.deleteByPrincipalAndAssociationId(
        principal.organization,
        dbRecordAssociationId,
      );

      if(dbRecordAssociation) {
        const { parentRecord, childRecord } = dbRecordAssociation;

        await this.amqpConnection.publish(
          process.env.MODULE_NAME,
          `${process.env.MODULE_NAME}.${SUB_DB_RECORD_ASSOCIATION_DELETED}`,
          {
            event: LogsConstants.DB_RECORD_ASSOCIATION_DELETED,
            principal,
            dbRecordAssociation,
            affected: deleteResult.affected,
          },
        );

        this.logsUserActivityService.createByPrincipal(
          principal,
          parentRecord.id,
          { parentRecordId: parentRecord.id, childRecordId: childRecord.id },
          LogsConstants.DB_RECORD_ASSOCIATION_DELETED,
        );
      }

      return { affected: deleteResult.affected, dbRecordAssociation };

    } catch (e) {
      throw new ExceptionType(e.statusCode, e.message);
    }
  }


  /**
   * Note: This method is used by other modules directly.
   * example: delete order items from an order using <order_id>/<order_item_id>
   *
   * @param principal
   * @param parentRecordId
   * @param childRecordId
   *
   */
  protected async deleteByOrganizationAndParentAndChildId(
    principal: OrganizationUserEntity,
    parentRecordId: string,
    childRecordId: string,
  ): Promise<{ affected: number }> {
    try {

      const dbRecordAssociation = await this.dbRecordAssociationRepository.getByParentRecordIdAndChildRecordId(
        principal.organization,
        parentRecordId,
        childRecordId,
      );

      const deleteResult: DeleteResult = await this.dbRecordAssociationRepository.deleteByOrganizationAndSourceRecordAndTargetRecord(
        principal.organization,
        dbRecordAssociation.parentRecord,
        dbRecordAssociation.childRecord,
      );

      this.logsUserActivityService.createByPrincipal(
        principal,
        parentRecordId,
        { parentRecordId, childRecordId },
        LogsConstants.DB_RECORD_ASSOCIATION_DELETED,
      );

      await this.amqpConnection.publish(
        process.env.MODULE_NAME,
        `${process.env.MODULE_NAME}.${SUB_DB_RECORD_ASSOCIATION_DELETED}`,
        {
          event: LogsConstants.DB_RECORD_ASSOCIATION_DELETED,
          principal,
          dbRecordAssociation,
        },
      );

      return { affected: deleteResult.affected };
    } catch (e) {
      throw new ExceptionType(e.statusCode, e.message);
    }
  }

  //================================================================================
  // Helpers & Validators
  //================================================================================

  /**
   *
   * @private
   * @param principal
   * @param schemaAssociation
   * @param parentRecordId
   * @param childRecord
   */
  private async shouldCreateChildAssociation(
    principal: OrganizationUserEntity,
    schemaAssociation: SchemaAssociationEntity,
    parentRecordId: string,
    childRecord: DbRecordEntity,
  ) {

    if(schemaAssociation) {

      const { type, id } = schemaAssociation;

      // Check if the record is already related
      const existingRecord = await this.dbRecordAssociationRepository.query(`
      SELECT id 
      FROM db_records_associations 
      WHERE organization_id = '${principal.organization.id}'
      AND schema_association_id = '${id}'
      AND deleted_at IS NULL
      AND child_record_id = '${childRecord.id}'
      AND parent_record_id = '${parentRecordId}'`);

      // check if the parent already has an association to a record in this schema
      const targetRecordAssociations = await this.dbRecordAssociationRepository.query(`
      SELECT id 
      FROM db_records_associations 
      WHERE organization_id = '${principal.organization.id}'
      AND schema_association_id = '${id}'
      AND parent_record_id = '${parentRecordId}'
      AND deleted_at IS NULL
      LIMIT 1;`);

      const hasExistingAssociation = targetRecordAssociations ? targetRecordAssociations.length > 0 : false;

      console.log('shouldCreateChildAssociation_hasExistingAssociation', hasExistingAssociation)
      console.log('parent_record_id', parentRecordId)

      return this.validateAssociationConstraints(
        existingRecord,
        hasExistingAssociation,
        type,
      );

    }
  }

  /**
   *
   * @private
   * @param principal
   * @param schemaAssociation
   * @param childRecordId
   * @param parentRecord
   */
  private async shouldCreateParentAssociation(
    principal: OrganizationUserEntity,
    schemaAssociation: SchemaAssociationEntity,
    childRecordId: string,
    parentRecord: DbRecordEntity,
  ) {

    if(schemaAssociation) {

      const { type, id } = schemaAssociation;

      // Check if the record is already related
      const existingRecord = await this.dbRecordAssociationRepository.query(`
      SELECT id 
      FROM db_records_associations 
      WHERE organization_id = '${principal.organization.id}'
      AND schema_association_id = '${id}'
      AND deleted_at IS NULL
      AND child_record_id = '${childRecordId}' 
      AND parent_record_id = '${parentRecord.id}'`);

      // check if the parent already has an association to a record in this schema
      const targetRecordAssociations = await this.dbRecordAssociationRepository.query(`
      SELECT id 
      FROM db_records_associations 
      WHERE organization_id = '${principal.organization.id}'
      AND schema_association_id = '${id}'
      AND parent_record_id = '${parentRecord.id}'
      AND deleted_at IS NULL
      LIMIT 1;`);

      const hasExistingAssociation = targetRecordAssociations ? targetRecordAssociations.length > 0 : false;


      console.log('shouldCreateParentAssociation_hasExistingAssociation', hasExistingAssociation)
      console.log('parent_record_id', parentRecord.id)

      return this.validateAssociationConstraints(
        existingRecord,
        hasExistingAssociation,
        type,
      );

    }
  }


  /**
   *
   * @param existingRecord
   * @param hasExistingAssociation
   * @param type
   * @private
   */
  private validateAssociationConstraints(
    existingRecord,
    hasExistingAssociation: boolean,
    type: SchemaAssociationCardinalityTypes,
  ): boolean {

    const isRecordRelated = existingRecord ? existingRecord.length > 0 : false;

    if(type === SchemaAssociationCardinalityTypes.ONE_TO_ONE && !hasExistingAssociation) {
      // if the target record does not have a relationship within this schema association
      // ONE to ONE would mean the child record can only have one parent record association
      return true;

    } else if(type === SchemaAssociationCardinalityTypes.MANY_TO_ONE && !hasExistingAssociation) {
      // if the owning record does not have a relationship within this schema association
      // MANY to ONE would mean the parent record can only have one child association and the child can have
      // many parent records
      return true;

    } else if(type === SchemaAssociationCardinalityTypes.ONE_TO_MANY && !isRecordRelated) {

      return true;

    } else if(type === SchemaAssociationCardinalityTypes.MANY_TO_MANY && !isRecordRelated) {

      return true;

    } else {

      return false;

    }
  }


  //================================================================================
  // Transform data
  //================================================================================

  /**
   * This methic adds all the relations ships to a key and value
   * [entityName]: object
   *
   * @param recordAssociations
   */
  private addRecordAssociationsToRecord(
    recordAssociations: DbRecordAssociationRecordsTransform[],
  ): { [key: string]: DbRecordAssociationRecordsTransform } {
    let obj = {};
    if(recordAssociations && recordAssociations.length > 0) {
      for(const relation of recordAssociations) {
        const entityName = relation.schema.entityName;
        // if the entityName is added to the obj and there are dbRecords merge them
        // this is for schemas that have a relation to them selves
        if(obj[entityName]) {
          // Relation exists and relation db records
          if(relation.dbRecords && obj[entityName].dbRecords) {
            // merge the new db records with the existing db records
            obj[entityName].dbRecords = [ ...obj[entityName].dbRecords, ...relation.dbRecords ];
          } else if(relation.dbRecords && !obj[entityName].dbRecords) {
            // relation db.Records exists but no existing dbRecords
            obj[entityName] = relation;
          }
        } else {
          obj[entityName] = relation;
        }

      }
    }
    return obj;
  }


  /**
   *
   * @param principal
   * @param transferorId
   * @param transfereeId
   * @param body
   */
  async _transferRelatedRecords(
    principal: OrganizationUserEntity,
    transferorId: string,
    transfereeId: string,
    body: DbRecordAssociationCreateUpdateDto[],
  ): Promise<DbRecordAssociationEntity[]> {
    try {
      const processAsync = [];
      // create associations by to record id and child recordIds
      const associations = await this._createRelatedRecords(
        principal,
        { recordId: transfereeId, body },
      );
      // delete associations by from record Id and child recordIds
      for(const association of body) {
        processAsync.push({
          func: await this.deleteByOrganizationAndParentAndChildId(
            principal,
            transferorId,
            association.recordId,
          ),
        });
      }

      await Promise.all(processAsync.map(elem => elem.func));

      return associations;
    } catch (e) {
      throw new ExceptionType(500, e.message);
    }
  }


  /**
   *
   * @param principal
   * @param schemaId
   */
  private async getSchemaAssociationsByPrincipalAndSchemaId(principal: OrganizationUserEntity, schemaId: string) {
    // we need to get child schema associations w/ schema
    const childSchemaAssociations: SchemaAssociationEntity[] = await this.schemasAssociationsService.getSchemaAssociationByOrganizationAndQuery(
      principal.organization,
      { parentSchemaId: schemaId },
    );
    // we need to get parent schema associations w/ schema
    const parentSchemaAssociations: SchemaAssociationEntity[] = await this.schemasAssociationsService.getSchemaAssociationByOrganizationAndQuery(
      principal.organization,
      { childSchemaId: schemaId },
    );
    return { childSchemaAssociations, parentSchemaAssociations };
  }

  /**
   *
   * @param record
   * @param childSchemaAssociations
   * @param parentSchemaAssociations
   */
  private async matchRecordWithSchemaAssociation(
    record: DbRecordEntity,
    childSchemaAssociations: SchemaAssociationEntity[],
    parentSchemaAssociations: SchemaAssociationEntity[],
  ) {

    const childSchemaAssociation = childSchemaAssociations.find(elem => elem.childSchemaId === record.schemaId);
    const parentSchemaAssociation = parentSchemaAssociations.find(elem => elem.parentSchemaId === record.schemaId);

    return { childSchemaAssociation, parentSchemaAssociation };

  }


  /**
   *
   * @param organization
   * @param params
   * @param options
   */
  private async buildRecordWithAssociatedColumnsAndTransform(
    organization: OrganizationEntity,
    params: IGetRecordsWithColumnMappingParams,
    options?: IMethodOptions,
  ): Promise<DbRecordEntityTransform[]> {
    try {

      const trace = await tracer.startSpan(
        'buildRecordWithAssociatedColumnsAndTransform',
        { childOf: options && options.tracerParent ? options.tracerParent.context() : undefined },
      ).setTag('params', params);

      const { relatedRecords, recordId, schemaAssociation, schema } = params;

      const parallelProcess = [];

      for(const relatedRecord of relatedRecords) {
        parallelProcess.push({
          func: this.transformRecordWithAssociationColumns(
            organization,
            recordId,
            relatedRecord,
            schemaAssociation,
            trace,
            schema,
          ),
        });
      }

      const transformed = await Promise.all(parallelProcess.map(elem => elem.func)).then(res => res);

      trace.finish();

      return transformed;

    } catch (e) {
      console.error(e);
      throw new ExceptionType(e.statusCode, e.message);
    }
  }

  /**
   *
   * @param organization
   * @param recordId
   * @param record
   * @param schemaAssociation
   * @param trace
   * @param schema
   * @private
   */
  private async transformRecordWithAssociationColumns(
    organization: OrganizationEntity,
    recordId: string,
    record: DbRecordEntity,
    schemaAssociation: SchemaAssociationEntityTransform,
    trace: any,
    schema: SchemaEntity,
  ) {
    try {

      const dbRecordAssociation = await this.getDbRecordAssociationByContext(
        organization,
        {
          sourceRecordId: recordId,
          targetRecord: record,
          isParentCtx: schemaAssociation.relationType === RelationTypeEnum.CHILD,
        },
        { tracerParent: trace },
      );

      let transformedRecord = DbRecordEntityTransform.transform(
        record,
        schema,
        schemaAssociation,
        dbRecordAssociation,
      );

      transformedRecord = await this.addAssociationColumns(
        organization,
        {
          record,
          dbRecordAssociation,
          transformed: transformedRecord,
        }, {
          tracerParent: trace,
        },
      );

      transformedRecord.relationType = schemaAssociation.relationType;

      return transformedRecord;

    } catch (e) {
      console.error(e);
      throw new ExceptionType(e.statusCode, e.message);
    }
  }

  /**
   *
   * @param organization
   * @param params
   * @param options
   * @private
   */
  private async addAssociationColumns(
    organization: OrganizationEntity,
    params: IAddAssociationColumnParams,
    options?: IMethodOptions,
  ) {
    try {
      const trace = await tracer.startSpan(
        'addAssociationColumns',
        { childOf: options && options.tracerParent ? options.tracerParent.context() : undefined },
      ).setTag('params', params);

      let { transformed } = params;
      const { record, dbRecordAssociation } = params;

      // If there is an association mapping Id
      // We want to map the columns for the record
      if(dbRecordAssociation && dbRecordAssociation.relatedAssociationId) {
        // Get the related record association
        // TODO_REFACTOR
        const relatedDbRecordAssociation = await this.dbRecordAssociationRepository.getByOrganizationAndId(
          organization,
          dbRecordAssociation.relatedAssociationId,
        );

        // Merge the column mappings for this association with the record
        transformed = await this.mergeRecordColumnsWithAssociationMappingColumns(
          organization,
          {
            dbRecordAssociation: relatedDbRecordAssociation,
            record,
            transformed,
          },
          { tracerParent: trace },
        );

      } else if(record && dbRecordAssociation) {
        // Get the record with association columns for the primary association
        transformed = await this.mergeRecordColumnsWithAssociationMappingColumns(
          organization,
          {
            dbRecordAssociation,
            record,
            transformed,
          },
          { tracerParent: trace },
        );
      }

      trace.finish();

      return transformed;

    } catch (e) {
      console.error(e);
      throw new ExceptionType(e.statusCode, e.message);
    }
  }

  /**
   *
   * @param organization
   * @param params
   * @param options
   * @private
   */
  private async mergeRecordColumnsWithAssociationMappingColumns(
    organization: OrganizationEntity,
    params: IMergeColumnsWithAssociationMappingParams,
    options?: IMethodOptions,
  ): Promise<DbRecordEntityTransform> {
    try {

      const trace = await tracer.startSpan(
        'mergeRecordColumnsWithAssociationMappingColumns',
        { childOf: options && options.tracerParent ? options.tracerParent.context() : undefined },
      ).setTag('params', params);

      const { dbRecordAssociation, record, transformed } = params;

      // before we get associated columns check if there are any
      const hasColumnMappings = await this.hasRelatedColumns(organization, record, dbRecordAssociation);

      if(hasColumnMappings) {

        const schemaColumns = await this.schemasColumnsService.getSchemaColumnsByOrganizationAndSchemaId(
          organization,
          record.schemaId,
        );

        const relatedRecordColumns = await this.getDbRecordColumnsByOrganizationAndId(
          organization,
          dbRecordAssociation,
          record,
        );

        if(relatedRecordColumns) {
          // we need to transform these columns to properties
          const associatedRecordColumns = DbRecordAssociationColumnEntityTransform.transform(
            relatedRecordColumns,
            schemaColumns,
          );
          // and merge the properties with the record properties
          transformed.properties = Object.assign({}, transformed.properties, associatedRecordColumns);
        }
      }

      trace.finish();

      return transformed;
    } catch (e) {
      console.error(e);
      throw new ExceptionType(e.statusCode, e.message);
    }
  }


  /**
   *
   * @param principal
   * @param response
   * @param eventType
   */
  private async clearCacheAndLogUserEvent(
    principal: OrganizationUserEntity,
    response: DbRecordAssociationEntity[],
    eventType: LogsConstants,
  ) {


    for(let association of response) {

      const parentEntity = association.parentEntity;
      const parentRecordId = association.parentRecordId;
      const childEntity = association.childEntity;
      const childRecordId = association.childRecordId;
      const relatedAssociationId = association.relatedAssociationId;

      const eventBody = {
        parentEntity,
        parentRecordId,
        childEntity,
        childRecordId,
        relatedAssociationId,
      };

      this.logsUserActivityService.createByPrincipal(
        principal,
        parentRecordId,
        eventBody,
        eventType,
      );

      this.logsUserActivityService.createByPrincipal(
        principal,
        childRecordId,
        eventBody,
        eventType,
      );

      this.dbSearchService.reIndexSearchDatabaseForRecord(principal, parentRecordId, association.parentSchemaId);
      this.dbSearchService.reIndexSearchDatabaseForRecord(principal, childRecordId, association.childSchemaId);

    }
  }


}
