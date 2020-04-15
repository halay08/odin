import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { tracer } from '@d19n/common/dist/logging/Tracer';
import { OrganizationEntity } from '@d19n/models/dist/identity/organization/organization.entity';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { LogsConstants } from '@d19n/models/dist/logs/logs.constants';
import {
  DbRecordAssociationConstants,
  DbRecordAssociationLookupKeys,
} from '@d19n/models/dist/schema-manager/db/record/association/types/db.record.association.constants';
import { SchemaAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/schema/association/dto/schema.association.create.update.dto';
import { SchemaAssociationEntity } from '@d19n/models/dist/schema-manager/schema/association/schema.association.entity';
import { SchemaAssociationCardinalityTypes } from '@d19n/models/dist/schema-manager/schema/association/types/schema.association.cardinality.types';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { validate } from 'class-validator';
import { DeleteResult } from 'typeorm';
import { DbCacheService } from '../../cache/db.cache.service';
import { IMethodOptions } from '../../db/interfaces/interfaces';
import { LogsUserActivityService } from '../../logs/user-activity/logs.user.activity.service';
import { SchemasService } from '../schemas.service';
import { dbRecordAssociationUrlConstants } from '../url.constants';
import { SchemasAssociationsRepository } from './schemas.associations.repository';


@Injectable()
export class SchemasAssociationsService {

  private readonly schemaAssociationRepository: SchemasAssociationsRepository;
  private readonly schemasService: SchemasService;
  private readonly logsUserActivityService: LogsUserActivityService;
  private readonly dbCacheService: DbCacheService;

  public constructor(
    @InjectRepository(SchemasAssociationsRepository) schemaAssociationRepository: SchemasAssociationsRepository,
    @Inject(forwardRef(() => SchemasService)) schemasService: SchemasService,
    @Inject(forwardRef(() => LogsUserActivityService)) logsUserActivityService: LogsUserActivityService,
    dbCacheService: DbCacheService,
  ) {
    this.schemaAssociationRepository = schemaAssociationRepository;
    this.schemasService = schemasService;
    this.logsUserActivityService = logsUserActivityService;
    this.dbCacheService = dbCacheService;
  }

  /**
   *
   * @param organization
   * @param schemaId
   * @param direction
   */
  public getAssociationsByOrganizationAndSchemaIdAndDirection(
    principal: OrganizationEntity | OrganizationUserEntity,
    schemaId: string,
    direction: DbRecordAssociationConstants,
  ): Promise<SchemaAssociationEntity[]> {
    return new Promise(async (resolve, reject) => {

      let organization = principal

      if(principal instanceof OrganizationUserEntity) {
        organization = principal.organization
      }


      // If the direction is not specified do not return data
      if(!DbRecordAssociationLookupKeys.includes(direction)) {
        return reject(new ExceptionType(400, 'should be GET_CHILD_RELATIONS | GET_PARENT_RELATIONS'));
      }

      if(direction === DbRecordAssociationConstants.GET_CHILD_RELATIONS) {
        const res = await this.schemaAssociationRepository
          .createQueryBuilder('schemaAssociation')
          .leftJoinAndSelect('schemaAssociation.childSchema', 'childSchema')
          .where('schemaAssociation.organization_id = :organizationId', { organizationId: organization.id })
          .andWhere('schemaAssociation.parent_schema_id = :parentSchemaId', { parentSchemaId: schemaId })
          .skip(0)
          .take(25)
          .getMany();

        // save to cache
        return resolve(res);
      }

      if(direction === DbRecordAssociationConstants.GET_PARENT_RELATIONS) {
        const res = await this.schemaAssociationRepository
          .createQueryBuilder('schemaAssociation')
          .leftJoinAndSelect('schemaAssociation.parentSchema', 'parentSchema')
          .where('schemaAssociation.organization_id = :organizationId', { organizationId: organization.id })
          .andWhere('schemaAssociation.child_schema_id = :childSchemaId', { childSchemaId: schemaId })
          .skip(0)
          .take(25)
          .getMany();
        // save to cache
        return resolve(res);
      }

    })
  }


  /**
   *
   * @param principal
   * @param schemaId
   * @param body
   *
   */
  public async createSchemaAssociationByPrincipal(
    principal: OrganizationUserEntity,
    schemaId: string,
    body: SchemaAssociationCreateUpdateDto,
  ): Promise<SchemaAssociationEntity> {
    try {
      const parentSchema: SchemaEntity = await this.schemasService.getSchemaByOrganizationAndId(
        principal.organization,
        {
          schemaId,
        },
      );
      const childSchema: SchemaEntity = await this.schemasService.getSchemaByOrganizationAndId(
        principal.organization,
        {
          schemaId: body.childSchemaId,
        },
      );
      const schemaAssociation: SchemaAssociationEntity = await this.schemaAssociationRepository.getByOrganizationParentAndChildSchema(
        principal.organization,
        parentSchema,
        body.childSchemaId,
      );

      if(schemaAssociation) {
        throw new ExceptionType(409, 'schema association already exists', null, schemaAssociation);
      } else {

        const schemaAssociation = new SchemaAssociationEntity();
        schemaAssociation.organization = principal.organization;
        schemaAssociation.label = parentSchema.entityName + '__' + childSchema.entityName;
        schemaAssociation.type = SchemaAssociationCardinalityTypes[body.type];
        schemaAssociation.parentSchema = parentSchema;
        schemaAssociation.childSchema = childSchema;
        schemaAssociation.findInSchema = body.findInSchema;
        schemaAssociation.findInChildSchema = body.findInChildSchema;
        schemaAssociation.getUrl = body.getUrl || dbRecordAssociationUrlConstants.getUrl;
        schemaAssociation.postUrl = body.postUrl || dbRecordAssociationUrlConstants.postUrl;
        schemaAssociation.putUrl = body.putUrl || dbRecordAssociationUrlConstants.putUrl;
        schemaAssociation.deleteUrl = body.deleteUrl || dbRecordAssociationUrlConstants.deleteUrl;
        schemaAssociation.isStatic = body.isStatic ? body.isStatic : false;
        schemaAssociation.position = body.position ? body.position : 0;
        schemaAssociation.parentActions = body.parentActions ? body.parentActions : 'LOOKUP_AND_CREATE';
        schemaAssociation.childActions = body.childActions ? body.childActions : 'LOOKUP_AND_CREATE';
        schemaAssociation.hasColumnMappings = body.hasColumnMappings ? body.hasColumnMappings : false;
        schemaAssociation.cascadeDeleteChildRecord = body.cascadeDeleteChildRecord ? body.cascadeDeleteChildRecord : false;

        const errors = await validate(schemaAssociation);
        if(errors.length > 0) {
          throw new ExceptionType(422, 'validation error', errors);
        }
        const res: SchemaAssociationEntity = await this.schemaAssociationRepository.save(schemaAssociation);

        await this.logsUserActivityService.createByPrincipal(
          principal,
          schemaAssociation.id,
          res,
          LogsConstants.SCHEMA_ASSOCIATION_CREATED,
        );

        // Get the schema
        const schema: SchemaEntity = await this.schemasService.getSchemaByOrganizationAndId(
          principal.organization,
          {
            schemaId,
          },
        );

        await this.dbCacheService.clearSchemasFromCache(
          principal.organization,
          `${parentSchema.moduleName}:${parentSchema.entityName}`,
        );
        await this.dbCacheService.clearSchemasFromCache(
          principal.organization,
          `${childSchema.moduleName}:${childSchema.entityName}`,
        );
        await this.dbCacheService.clearSchemasFromCache(principal.organization, parentSchema.id);
        await this.dbCacheService.clearSchemasFromCache(principal.organization, childSchema.id);

        return res;
      }
    } catch (e) {
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }

  /**
   *
   * @param principal
   * @param associationId
   * @param body
   */
  public async updateSchemaAssociationByPrincipalAndId(
    principal: OrganizationUserEntity,
    associationId: string,
    body: SchemaAssociationCreateUpdateDto,
  ): Promise<SchemaAssociationEntity> {
    try {
      const schemaAssociation: SchemaAssociationEntity = await this.schemaAssociationRepository.findOne({
        organization: principal.organization,
        id: associationId,
      }, {
        relations: [
          'parentSchema',
          'childSchema',
        ],
      });

      if(!schemaAssociation) {
        throw new ExceptionType(404, 'not found');
      }

      schemaAssociation.type = SchemaAssociationCardinalityTypes[body.type];
      schemaAssociation.findInSchema = body.findInSchema;
      schemaAssociation.findInChildSchema = body.findInChildSchema;
      schemaAssociation.getUrl = body.getUrl;
      schemaAssociation.postUrl = body.postUrl;
      schemaAssociation.putUrl = body.putUrl;
      schemaAssociation.deleteUrl = body.deleteUrl;
      schemaAssociation.position = body.position;
      schemaAssociation.parentActions = body.parentActions;
      schemaAssociation.childActions = body.childActions;
      schemaAssociation.hasColumnMappings = body.hasColumnMappings;
      schemaAssociation.cascadeDeleteChildRecord = body.cascadeDeleteChildRecord;

      const errors = await validate(schemaAssociation, { skipUndefinedProperties: true });
      if(errors.length > 0) {
        throw new ExceptionType(422, 'validation error', errors);
      }
      const res: SchemaAssociationEntity = await this.schemaAssociationRepository.save(schemaAssociation);
      await this.logsUserActivityService.createByPrincipal(
        principal,
        schemaAssociation.id,
        schemaAssociation,
        LogsConstants.SCHEMA_ASSOCIATION_UPDATED,
      );

      await this.dbCacheService.clearSchemasFromCache(
        principal.organization,
        `${res.parentSchema.moduleName}:${res.parentSchema.entityName}`,
      );
      await this.dbCacheService.clearSchemasFromCache(
        principal.organization,
        `${res.childSchema.moduleName}:${res.childSchema.entityName}`,
      );
      await this.dbCacheService.clearSchemasFromCache(principal.organization, res.parentSchema.id);
      await this.dbCacheService.clearSchemasFromCache(principal.organization, res.childSchema.id);

      return res;
    } catch (e) {
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }

  /**
   *
   * @param principal
   * @param associationId
   */
  public async deleteSchemaAssociationByPrincipalAndId(
    principal: OrganizationUserEntity,
    associationId: string,
  ): Promise<{ affected: number }> {
    try {
      const schemaAssociation: SchemaAssociationEntity = await this.schemaAssociationRepository.getByOrganizationAndId(
        principal.organization,
        associationId,
      );

      if(!schemaAssociation) {
        throw new ExceptionType(404, 'not found');
      }

      // check if db_records exist
      const records = await this.schemaAssociationRepository.query(`SELECT id FROM db_records_associations WHERE schema_association_id = '${associationId}' LIMIT 1`);

      if(records.length > 0) {
        throw new ExceptionType(409, 'this association has records and cannot be deleted');
      }

      // Check for DbRecordAssociations throw error
      const deleteResult: DeleteResult = await this.schemaAssociationRepository.deleteByPrincipalAndId(
        principal.organization,
        associationId,
      );
      await this.logsUserActivityService.createByPrincipal(principal, associationId, {
        id: associationId,
        affected: deleteResult.affected,
      }, LogsConstants.SCHEMA_ASSOCIATION_DELETED);

      // Clear all schema caches using both keys
      await this.dbCacheService.clearSchemasFromCache(
        principal.organization,
        `${schemaAssociation.parentSchema.moduleName}:${schemaAssociation.parentSchema.entityName}`,
      );
      await this.dbCacheService.clearSchemasFromCache(
        principal.organization,
        `${schemaAssociation.childSchema.moduleName}:${schemaAssociation.childSchema.entityName}`,
      );
      await this.dbCacheService.clearSchemasFromCache(principal.organization, schemaAssociation.parentSchema.id);
      await this.dbCacheService.clearSchemasFromCache(principal.organization, schemaAssociation.childSchema.id)

      return { affected: deleteResult.affected };
    } catch (e) {
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }

  // New from Refactor: ODN-595

  /**
   *
   * @param organization
   * @param associationId
   * @param relations
   */
  public async getSchemaAssociationByOrganizationAndId(
    principal: OrganizationEntity | OrganizationUserEntity,
    associationId: string,
    relations?: string[],
  ): Promise<SchemaAssociationEntity> {
    try {

      let organization = principal

      if(principal instanceof OrganizationUserEntity) {
        organization = principal.organization
      }

      const response: SchemaAssociationEntity = await this.schemaAssociationRepository.getSchemaAssociationByOrganizationAndId(
        organization,
        associationId,
        relations,
      );
      if(!response) {
        throw new ExceptionType(404, 'not found');
      }
      return response;
    } catch (e) {
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }

  /**
   *
   * @param organization
   * @param whereQuery
   * @param relations
   */
  public async getSchemaAssociationByOrganizationAndQuery(
    organization: OrganizationEntity,
    whereQuery: { [key: string]: any },
    relations?: string[],
  ): Promise<SchemaAssociationEntity[]> {
    try {
      return await this.schemaAssociationRepository.getSchemaAssociationByOrganizationAndQuery(
        organization,
        whereQuery,
        relations,
      );
    } catch (e) {
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }

  /**
   *
   * @param organization
   * @param schemaId
   */
  public async getParentAndChildSchemaAssociationsByOrganizationAndSchemaId(
    principal: OrganizationEntity | OrganizationUserEntity,
    schemaId: string,
    options?: IMethodOptions,
  ): Promise<{ childAssociations: SchemaAssociationEntity[], parentAssociations: SchemaAssociationEntity[] }> {
    try {

      let organization = principal

      if(principal instanceof OrganizationUserEntity) {
        organization = principal.organization
      }

      const trace = await tracer.startSpan(
        'getParentAndChildSchemaAssociationsByOrganizationAndSchemaId',
        { childOf: options && options.tracerParent ? options.tracerParent.context() : undefined },
      );

      const { childAssociations, parentAssociations } = await Promise.all([
        await this.schemaAssociationRepository.getSchemaAssociationByOrganizationAndQuery(
          organization,
          { parentSchemaId: schemaId },
          [],
        ),
        await this.schemaAssociationRepository.getSchemaAssociationByOrganizationAndQuery(
          organization,
          { childSchemaId: schemaId },
          [],
        ),
      ]).then(res => ({
        childAssociations: res[0],
        parentAssociations: res[1],
      }));

      trace.finish();

      return { childAssociations, parentAssociations };
    } catch (e) {
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }

}
