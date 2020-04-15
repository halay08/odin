import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { tracer } from '@d19n/common/dist/logging/Tracer';
import { OrganizationEntity } from '@d19n/models/dist/identity/organization/organization.entity';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { LogsConstants } from '@d19n/models/dist/logs/logs.constants';
import { RelationTypeEnum } from '@d19n/models/dist/schema-manager/db/record/association/types/db.record.association.constants';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { SchemaAssociationEntity } from '@d19n/models/dist/schema-manager/schema/association/schema.association.entity';
import { SchemaAssociationEntityTransform } from '@d19n/models/dist/schema-manager/schema/association/transform/schema.association.entity.transform';
import { SchemaCreateUpdateDto } from '@d19n/models/dist/schema-manager/schema/dto/schema.create.update.dto';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SchemaEntityTransform } from '@d19n/models/dist/schema-manager/schema/transform/schema.entity.transform';
import { Client } from '@elastic/elasticsearch';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { pascalCase } from 'change-case';
import { validate } from 'class-validator';
import { DeleteResult } from 'typeorm';
import { DbCacheService } from '../cache/db.cache.service';
import { ELASTIC_SEARCH_CLIENT } from '../common/Constants';
import { ElasticSearchClient } from '../common/ElasticSearchClient';
import { IGetSchemaByIdParams, IMethodOptions } from '../db/interfaces/interfaces';
import { LogsUserActivityService } from '../logs/user-activity/logs.user.activity.service';
import { SchemasAssociationsService } from './associations/schemas.associations.service';
import { SchemasColumnsService } from './columns/schemas.columns.service';
import { SchemasRepository } from './schemas.repository';
import { dbRecordUrlConstants } from './url.constants';

@Injectable()
export class SchemasService {

  private elasticSearchClient: ElasticSearchClient;

  public constructor(
    @InjectRepository(SchemasRepository) private schemaRepository: SchemasRepository,
    @Inject(ELASTIC_SEARCH_CLIENT) public readonly esClient: Client,
    @Inject(forwardRef(() => SchemasAssociationsService)) private schemasAssociationsService: SchemasAssociationsService,
    @Inject(forwardRef(() => SchemasColumnsService)) private schemasColumnsService: SchemasColumnsService,
    @Inject(forwardRef(() => LogsUserActivityService)) private logsUserActivityService: LogsUserActivityService,
    private dbCacheService: DbCacheService,
  ) {

    this.schemaRepository = schemaRepository;
    this.logsUserActivityService = logsUserActivityService;
    this.schemasAssociationsService = schemasAssociationsService;
    this.elasticSearchClient = new ElasticSearchClient(esClient);
    this.dbCacheService = dbCacheService;
    this.schemasColumnsService = schemasColumnsService;

  }

  /**
   * Retrieve all schemas that belong to the logged in users organization.
   *
   * @returns {Promise<Array<SchemaEntity>>}
   * @param principal
   */
  public listSchemasByOrganization(principal: OrganizationEntity | OrganizationUserEntity): Promise<SchemaEntity[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const res: SchemaEntity[] = await this.schemaRepository.getByOrganization(principal);
        return resolve(res);
      } catch (e) {
        return reject(new ExceptionType(500, e.message));
      }
    });
  }

  /**
   * Retrieve single schema by module and entity
   *
   * @param principal
   * @param {string} moduleName
   *
   */
  public async getSchemasByOrganizationAndModule(
    principal: OrganizationEntity | OrganizationUserEntity,
    moduleName: string,
  ): Promise<SchemaEntity[]> {
    try {
      const schemas: SchemaEntity[] = await this.schemaRepository.getByOrganizationAndModule(
        principal,
        moduleName,
      );
      if(!schemas) {
        throw new ExceptionType(404, 'no schemas found in that module');
      }
      return schemas;
    } catch (e) {
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }


  /**
   *
   * @param principal
   * @param schemaId
   */
  public async generateNewRecordNumberFromSchema(
    principal: OrganizationEntity | OrganizationUserEntity,
    schemaId: string,
    options?: IMethodOptions,
  ): Promise<SchemaEntity> {
    try {

      const trace = await tracer.startSpan(
        'generateNewRecordNumberFromSchema',
        { childOf: options && options.tracerParent ? options.tracerParent.context() : undefined },
      );

      const res = await this.schemaRepository.getByOrganizationAndIdAutoIncrement(principal, schemaId, true);

      trace.finish();

      return res;

    } catch (e) {
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }

  /**
   * Retrieve single schema by module and entity
   *
   * @param principal
   * @param {string} moduleName
   * @param {string} entityName
   * @param relations
   */
  public async getSchemaByOrganizationAndModuleAndEntity(
    principal: OrganizationEntity | OrganizationUserEntity,
    moduleName: string,
    entityName: string,
    relations?: string[],
  ): Promise<SchemaEntity> {
    try {

      let organization = principal

      if(principal instanceof OrganizationUserEntity) {
        organization = principal.organization
      }

      console.log('orgInstanceIsUser: ', organization instanceof OrganizationUserEntity)
      console.log('orgInstanceIsOrg: ', organization instanceof OrganizationEntity)
      console.log('principalInstanceIsUser: ', principal instanceof OrganizationUserEntity)

      // Add caching
      const cacheKey =
        `schemaService-getSchemaByOrganizationAndModuleAndEntity-${organization.id}-${moduleName}:${entityName}`;
      const cached = await this.dbCacheService.getFromCache<SchemaEntity>(cacheKey);

      if(cached) {
        if(principal instanceof OrganizationUserEntity) {
          if(this.hasPermissionsForSchema(principal, cached)) return cached
        } else {
          return cached
        }
      }

      const schema: SchemaEntity = await this.schemaRepository.getSchemaByOrganizationModuleAndEntity(
        principal,
        moduleName,
        entityName,
      );

      if(!schema) {
        throw new ExceptionType(404, 'schema not found');
      }

      // get the schema columns
      schema.columns = await this.schemasColumnsService.getSchemaColumnsByOrganizationAndSchemaId(
        principal,
        schema.id,
      );

      await this.dbCacheService.saveToCache<SchemaEntity>(cacheKey, schema);

      return schema;
    } catch (e) {
      throw new
      ExceptionType(e.statusCode, e.message, e.validation);
    }
  }

  /**
   * Retrieve single schema by module and entity
   *
   * @param {OrganizationEntity | OrganizationUserEntity} principal
   * @param {string} moduleName
   * @param {string} entityName
   * @param relations
   */
  public async getFullSchemaByOrganizationAndModuleAndEntity(
    principal: OrganizationEntity | OrganizationUserEntity,
    moduleName: string,
    entityName: string,
    relations?: string[],
  ): Promise<SchemaEntity> {
    try {

      let organization = principal
      if(principal instanceof OrganizationUserEntity) {
        organization = principal.organization
      }

      // Add caching
      const cacheKey = `schemaService-getFullSchemaByOrganizationAndModuleAndEntity-${organization.id}-${moduleName}:${entityName}`;
      const cached = await this.dbCacheService.getFromCache<SchemaEntity>(cacheKey);

      if(cached) {
        if(principal instanceof OrganizationUserEntity) {
          if(this.hasPermissionsForSchema(principal, cached)) return cached
        } else {
          return cached
        }
      }

      // get the schema by module and entity
      const schema: SchemaEntity = await this.schemaRepository.getSchemaByOrganizationModuleAndEntity(
        principal,
        moduleName,
        entityName,
      );


      if(!schema) {
        throw new ExceptionType(404, 'schema not found');
      }

      // get the full schema with columns and associations
      const res = await this.getFullSchemaByOrganizationAndIdWithAssociations(principal, { schemaId: schema.id });

      await this.dbCacheService.saveToCache<SchemaEntity>(cacheKey, res);

      return res;

    } catch (e) {
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }


  /**
   * Get the schema with associations
   * @param {OrganizationEntity | OrganizationUserEntity} principal
   * @param params
   * @param options
   */
  public async getFullSchemaByOrganizationAndIdWithAssociations(
    principal: OrganizationEntity | OrganizationUserEntity,
    params: { schemaId: string },
    options?: IMethodOptions,
  ): Promise<SchemaEntity> {
    try {
      let organization = principal
      if(principal instanceof OrganizationUserEntity) {
        organization = principal.organization
      }

      const trace = await tracer.startSpan(
        'getSchemaByOrganizationAndIdWithAssociations',
        { childOf: options && options.tracerParent ? options.tracerParent.context() : undefined },
      );

      const { schemaId } = params;
      // Add caching
      const cacheKey = `schemaService-getSchemaByOrganizationAndIdWithAssociations-${organization.id}-${schemaId}`;
      const cached = await this.dbCacheService.getFromCache<SchemaEntity>(cacheKey);

      if(cached) {
        trace.finish();
        return cached;
      }

      const schema = await this.schemaRepository.getSchemaByOrganizationAndId(principal, schemaId);

      // get the schema columns
      schema.columns = await this.schemasColumnsService.getSchemaColumnsByOrganizationAndSchemaId(
        organization,
        schema.id,
        { tracerParent: trace },
      );

      const associations = await this.getSchemaAssociations(organization, schemaId, { tracerParent: trace });

      // add the associations to the schema
      schema.associations = associations;

      trace.finish();

      await this.dbCacheService.saveToCache<SchemaEntity>(cacheKey, schema);

      return schema;

    } catch (e) {
      console.error(e);
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }


  /**
   *
   * @param organization
   * @param schemaId
   * @param options
   * @private
   */
  private async getSchemaAssociations(
    organization: OrganizationEntity,
    schemaId: string,
    options?: IMethodOptions,
  ): Promise<SchemaAssociationEntity[]> {

    try {

      const { tracerParent } = options;

      const {
        childAssociations,
        parentAssociations,
      } = await this.schemasAssociationsService.getParentAndChildSchemaAssociationsByOrganizationAndSchemaId(
        organization,
        schemaId,
        { tracerParent },
      );

      const associations = [];
      // transform child associations
      for(const childAssociation of childAssociations) {

        const association = childAssociation;
        association.childSchema = await this.getSchemaByOrganizationAndId(
          organization,
          { schemaId: association.childSchemaId },
        );

        associations.push(association);
      }

      // transform parent associations
      for(const parentAssociation of parentAssociations) {

        const association = parentAssociation;
        association.parentSchema = await this.getSchemaByOrganizationAndId(
          organization,
          { schemaId: association.parentSchemaId },
        );

        associations.push(association);
      }

      return associations;

    } catch (e) {

      console.error(e);
      throw new ExceptionType(e.statusCode, e.message);

    }
  }

  /**
   *
   * @param organization
   * @param schemaId
   * @param options
   * @private
   */
  private async getSchemaAssociationsTransformed(
    organization: OrganizationEntity,
    schemaId: string,
    options?: IMethodOptions,
  ): Promise<SchemaAssociationEntityTransform[]> {

    try {

      const { tracerParent } = options;

      const {
        childAssociations,
        parentAssociations,
      } = await this.schemasAssociationsService.getParentAndChildSchemaAssociationsByOrganizationAndSchemaId(
        organization,
        schemaId,
        { tracerParent },
      );

      const associations = [];
      // transform child associations
      for(const childAssociation of childAssociations) {

        const association = childAssociation;

        const childSchema = await this.getSchemaByOrganizationAndId(
          organization,
          { schemaId: association.childSchemaId },
        );

        const transformed = SchemaAssociationEntityTransform.transform(association);
        transformed.relationType = RelationTypeEnum.CHILD;
        transformed.childSchema = SchemaEntityTransform.transform(childSchema);

        associations.push(transformed);

      }

      // transform parent associations
      for(const parentAssociation of parentAssociations) {

        const association = parentAssociation;
        const parentSchema = await this.getSchemaByOrganizationAndId(
          organization,
          { schemaId: association.parentSchemaId },
        );

        const transformed = SchemaAssociationEntityTransform.transform(association);
        transformed.relationType = RelationTypeEnum.PARENT;
        transformed.parentSchema = SchemaEntityTransform.transform(parentSchema);

        associations.push(transformed);

      }

      return associations;

    } catch (e) {

      console.error(e);
      throw new ExceptionType(e.statusCode, e.message);

    }
  }

  /**
   * Get the schema with associations
   * @param {OrganizationEntity | OrganizationUserEntity} principal
   * @param schemaId
   */
  public async getSchemaByOrganizationAndIdWithAssociations(
    principal: OrganizationEntity | OrganizationUserEntity,
    params: { schemaId: string },
    options?: IMethodOptions,
  ): Promise<SchemaEntity> {
    try {
      let organization = principal
      if(principal instanceof OrganizationUserEntity) {
        organization = principal.organization
      }

      const trace = await tracer.startSpan(
        'getSchemaByOrganizationAndIdWithAssociations',
        { childOf: options && options.tracerParent ? options.tracerParent.context() : undefined },
      );

      const { schemaId } = params;
      // Add caching
      const cacheKey = `schemaService-getSchemaByOrganizationAndIdWithAssociations-${organization.id}-${schemaId}`;
      const cached = await this.dbCacheService.getFromCache<SchemaEntity>(cacheKey);
      if(cached) {
        if(principal instanceof OrganizationUserEntity) {
          if(this.hasPermissionsForSchema(principal, cached)) {
            trace.finish();
            return cached
          }
        } else {
          trace.finish();
          return cached
        }
      }

      const schema = await this.schemaRepository.getSchemaByOrganizationAndId(principal, schemaId);

      if(!schema) {
        throw new ExceptionType(404, `could not find schema with id ${schemaId}`);
      }

      // get the schema columns
      schema.columns = await this.schemasColumnsService.getSchemaColumnsByOrganizationAndSchemaId(
        organization,
        schema.id,
        { tracerParent: trace },
      );

      const associations = await this.getSchemaAssociations(organization, schemaId, { tracerParent: trace });

      // add the associations to the schema
      schema.associations = associations;

      trace.finish();

      await this.dbCacheService.saveToCache<SchemaEntity>(cacheKey, schema);

      return schema;

    } catch (e) {
      console.error(e);
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }


  /**
   * Get the schema with associations
   * @param {OrganizationEntity | OrganizationUserEntity} principal
   * @param params
   s
   * @param options
   */
  public async getSchemaByOrganizationAndIdWithAssociationsTransformed(
    principal: OrganizationEntity | OrganizationUserEntity,
    params: {
      schemaId?: string,
    },
    options?: IMethodOptions,
  ): Promise<SchemaEntityTransform> {
    try {
      let organization = principal
      if(principal instanceof OrganizationUserEntity) {
        organization = principal.organization
      }

      const trace = await tracer.startSpan(
        'getSchemaByOrganizationAndIdWithAssociationsTransformed',
        { childOf: options && options.tracerParent ? options.tracerParent.context() : undefined },
      );
      const { schemaId } = params;

      // Add caching
      const cacheKey = `schemaService-getSchemaByOrganizationAndIdWithAssociationsTransformed-${organization.id}-${schemaId}`;
      const cached = await this.dbCacheService.getFromCache<SchemaEntityTransform>(cacheKey);
      if(cached) {
        if(principal instanceof OrganizationUserEntity) {
          if(this.hasPermissionsForSchema(principal, cached)) {
            trace.finish();
            return cached
          }
        } else {
          trace.finish();
          return cached
        }
      }

      // Get schema by entity or schemaId
      const schema = await this.schemaRepository.getSchemaByOrganizationAndId(principal, schemaId);
      // get the schema columns
      schema.columns = await this.schemasColumnsService.getSchemaColumnsByOrganizationAndSchemaId(
        organization,
        schema.id,
        { tracerParent: trace },
      );

      const transformed: SchemaEntityTransform = SchemaEntityTransform.transform(schema);

      const associations = await this.getSchemaAssociationsTransformed(organization, schemaId, { tracerParent: trace });

      // add the associations to the schema
      transformed.associations = associations;

      trace.finish();

      await this.dbCacheService.saveToCache<SchemaEntityTransform>(cacheKey, transformed);

      return transformed;

    } catch (e) {
      console.error(e);
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }

  /**
   *
   * @param organization
   * @param params
   * @param schemaId
   * @param relations
   * @param options
   */
  public async getSchemaByOrganizationAndId(
    organization: OrganizationEntity,
    params: IGetSchemaByIdParams,
    options?: IMethodOptions,
  ): Promise<SchemaEntity> {
    try {

      const trace = await tracer.startSpan(
        'getSchemaByOrganizationAndId',
        { childOf: options && options.tracerParent ? options.tracerParent.context() : undefined },
      ).setTag('params', params);

      // Add caching
      const cacheKey = `schemaService-getSchemaByOrganizationAndId-${organization.id}-${params.schemaId}`;
      const cached = await this.dbCacheService.getFromCache<SchemaEntity>(cacheKey);

      if(cached) {
        return cached;
      }

      const { schemaId } = params;

      const res = await this.schemaRepository.getSchemaByOrganizationAndId(organization, schemaId);
      // get the schema columns
      res.columns = await this.schemasColumnsService.getSchemaColumnsByOrganizationAndSchemaId(
        organization,
        schemaId,
        { tracerParent: trace },
      );

      trace.finish();

      await this.dbCacheService.saveToCache<SchemaEntity>(cacheKey, res);

      return res;

    } catch (e) {
      console.error(e);
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }

  /**
   * New method that only returns the schema by entity
   * @param organization
   * @param entity
   * @param relations
   */
  public async getSchemaByOrganizationAndEntity(
    organization: OrganizationEntity,
    entity: string,
  ): Promise<SchemaEntity> {

    // Add caching
    const cacheKey = `schemaService-getSchemaByOrganizationAndEntity-${organization.id}-${entity}`;
    const cached = await this.dbCacheService.getFromCache<SchemaEntity>(cacheKey);

    if(cached) {
      return cached;
    }

    const { moduleName, entityName } = SchemasService.splitEntityToModuleAndEntity(entity);
    const res = await this.schemaRepository.getSchemaByOrganizationModuleAndEntity(
      organization,
      moduleName,
      entityName,
    );

    // get the schema columns
    res.columns = await this.schemasColumnsService.getSchemaColumnsByOrganizationAndSchemaId(organization, res.id);

    await this.dbCacheService.saveToCache<SchemaEntity>(cacheKey, res);

    return res;
  }

  /**
   * A helper method that will parse the body of DTO DbRecordCreateUpdate
   * and return the Schema using the schemaId or entity
   * @param organization
   * @param body
   * @param relations
   */
  public async getSchemaByOrganizationAndEntityOrId(
    organization: OrganizationEntity,
    body: DbRecordCreateUpdateDto,
  ): Promise<SchemaEntity> {
    try {
      if(!!body.schemaId) {

        return await this.getSchemaByOrganizationAndId(organization, { schemaId: body.schemaId });

      } else if(!!body.entity) {

        return await this.getSchemaByOrganizationAndEntity(organization, body.entity);

      }
      throw new ExceptionType(404, 'no schema found by Id or entity');
    } catch (e) {
      console.error(e);
      throw new ExceptionType(e.statusCode, e.message);
    }
  }


  /**
   * @param principal
   * @param body
   * @param query
   */
  public async createSchemaByPrincipal(
    principal: OrganizationUserEntity,
    body: SchemaCreateUpdateDto,
    query: { upsert: boolean },
  ): Promise<SchemaEntity> {
    try {

      const schema: SchemaEntity = await this.schemaRepository.findOne({
        where: {
          organization: principal.organization,
          moduleName: body.moduleName,
          entityName: body.entityName,
        },
      });

      if(schema) {
        if(query.upsert) {
          return await this.updateSchemaByPrincipalAndId(principal, schema.id, body);
        } else {
          throw new ExceptionType(
            409,
            'a schema with that moduleName and entityName already exists',
            null,
            schema,
          );
        }
      }

      const newSchema: SchemaEntity = new SchemaEntity();
      newSchema.organization = principal.organization;
      newSchema.name = body.name ? body.name.trim().toLowerCase() : null;
      newSchema.description = body.description ? body.description.trim() : null;
      newSchema.moduleName = pascalCase(body.moduleName);
      newSchema.entityName = pascalCase(body.entityName);
      newSchema.recordNumber = body.recordNumber;
      newSchema.recordNumberPrefix = body.recordNumberPrefix;
      newSchema.searchUrl = body.searchUrl || dbRecordUrlConstants.searchUrl;
      newSchema.getUrl = body.getUrl || dbRecordUrlConstants.getUrl;
      newSchema.postUrl = body.postUrl || dbRecordUrlConstants.postUrl;
      newSchema.putUrl = body.putUrl || dbRecordUrlConstants.putUrl;
      newSchema.deleteUrl = body.deleteUrl || dbRecordUrlConstants.deleteUrl;
      newSchema.isSequential = body.isSequential;
      newSchema.isStatic = false;
      newSchema.isHidden = false;
      newSchema.isTitleUnique = body.isTitleUnique ? body.isTitleUnique : false;
      newSchema.isTitleRequired = body.isTitleRequired;
      newSchema.position = body.position;
      newSchema.queryable = true;
      newSchema.upsertOnCreate = true;
      newSchema.assignable = false;
      newSchema.replicateable = true;
      newSchema.retrievable = true;
      newSchema.searchable = true;
      newSchema.triggerable = true;
      newSchema.undeletable = true;
      newSchema.updateable = true;
      newSchema.hasTitle = true;

      const errors = await validate(newSchema);
      if(errors.length > 0) {
        throw new ExceptionType(422, 'validation error', errors);
      }

      const res: SchemaEntity = await this.schemaRepository.save(newSchema);

      // if the schema is sequential create a new sequence
      if(res.isSequential) {

        const sequenceName = `${res.id}_seq`;
        await this.schemaRepository.query(`CREATE SEQUENCE IF NOT EXISTS "${sequenceName}" START ${res.recordNumber || 1} MAXVALUE 1000000000000`);

      }

      this.elasticSearchClient.createIndices(res.id);
      this.logsUserActivityService.createByPrincipal(principal, res.id, res, LogsConstants.SCHEMA_CREATED);

      return res;

    } catch (e) {
      console.error(e);
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }

  /**
   * Update an existing schema record.
   *
   * @param principal
   * @param schemaId
   * @param body
   *
   * @returns {Promise<ApiResponseType>}
   */
  public async updateSchemaByPrincipalAndId(
    principal: OrganizationUserEntity,
    schemaId: string,
    body: SchemaCreateUpdateDto,
  ): Promise<SchemaEntity> {
    try {
      const schema: SchemaEntity = await this.schemaRepository.findOne({
        where: {
          organization: principal.organization,
          id: schemaId,
        },
      });
      // Update the schema properties
      schema.name = body.name ? body.name.trim().toLowerCase() : null;
      schema.description = body.description ? body.description.trim() : null;
      schema.recordNumber = body.recordNumber;
      schema.recordNumberPrefix = body.recordNumberPrefix;
      schema.searchUrl = body.searchUrl;
      schema.getUrl = body.getUrl;
      schema.postUrl = body.postUrl;
      schema.putUrl = body.putUrl;
      schema.deleteUrl = body.deleteUrl;
      schema.isSequential = body.isSequential;
      schema.isHidden = body.isHidden;
      schema.hasTitle = body.hasTitle;
      schema.isTitleUnique = body.isTitleUnique;
      schema.isTitleRequired = body.isTitleRequired;
      schema.upsertOnCreate = body.upsertOnCreate;
      schema.assignable = body.assignable;
      schema.queryable = body.queryable;
      schema.replicateable = body.replicateable;
      schema.retrievable = body.retrievable;
      schema.searchable = body.searchable;
      schema.triggerable = body.triggerable;
      schema.undeletable = body.undeletable;
      schema.updateable = body.updateable;
      schema.position = body.position;

      const errors = await validate(schema);
      if(errors.length > 0) {
        throw new ExceptionType(422, 'validation error', errors);
      }

      const res = await this.schemaRepository.save(schema);

      await this.logsUserActivityService.createByPrincipal(
        principal,
        schema.id,
        schema,
        LogsConstants.SCHEMA_UPDATED,
      );

      // if the schema is sequential create a new sequence if not already created
      if(res.isSequential) {
        const sequenceName = `${schema.id}_seq`;
        await this.schemaRepository.query(`CREATE SEQUENCE IF NOT EXISTS "${sequenceName}" START ${res.recordNumber || 1} MAXVALUE 1000000000000`);
      }

      await this.dbCacheService.clearSchemasFromCache(principal.organization, schema.id);
      await this.dbCacheService.clearSchemasFromCache(
        principal.organization,
        `${schema.moduleName}:${schema.entityName}`,
      );

      // return the latest
      const schemaRes = await this.schemaRepository.findOne(schema.id);
      // get the schema columns
      schemaRes.columns = await this.schemasColumnsService.getSchemaColumnsByOrganizationAndSchemaId(
        principal,
        schema.id,
      );

      return schemaRes;

    } catch (e) {
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }

  /**
   * Delete schema by id and owning organization.
   *
   * @param principal
   * @param {string} schemaId
   *
   */
  public async deleteSchemaByPrincipalAndId(
    principal: OrganizationUserEntity,
    schemaId: string,
  ): Promise<{ affected: number }> {
    try {

      // check if db_records exist
      const records = await this.schemaRepository.query(`SELECT id FROM db_records WHERE schema_id = '${schemaId}' AND db_records.deleted_at IS NULL LIMIT 1`);

      if(records.length > 0) {
        throw new ExceptionType(409, 'this schema has records has records and cannot be deleted');
      }

      const deleteResult: DeleteResult = await this.schemaRepository.delete({
        organization: principal.organization,
        id: schemaId,
      });
      // Log event
      await this.logsUserActivityService.createByPrincipal(principal, schemaId, {
        id: schemaId,
        affected: deleteResult.affected,
      }, LogsConstants.SCHEMA_DELETED);

      // if the schema is sequential create a new sequence
      const sequenceName = `${schemaId}_seq`;
      await this.schemaRepository.query(`DROP SEQUENCE IF EXISTS "${sequenceName}"`);

      await this.dbCacheService.clearSchemasFromCache(principal.organization, schemaId);

      return { affected: deleteResult.affected };
    } catch (e) {
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }

  /**
   *
   * @param entity
   */
  private static splitEntityToModuleAndEntity(entity: string) {
    const split = entity.split(':');
    const moduleName = split[0];
    const entityName = split[1];
    return { moduleName, entityName };
  }


  private hasPermissionsForSchema(principal, schema) {
    const permissionsIds = this.schemaRepository.getPermissionsIds(principal)
    if(!schema?.permissions) return true
    return !schema.permissions.every(p => {
      if(permissionsIds.includes(p.id)) {
        return false
      }
      return true
    })
  }
}
