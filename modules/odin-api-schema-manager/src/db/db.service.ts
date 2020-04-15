import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { tracer } from '@d19n/common/dist/logging/Tracer';
import { OrganizationEntity } from '@d19n/models/dist/identity/organization/organization.entity';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { LogsConstants } from '@d19n/models/dist/logs/logs.constants';
import { SendgridEmailEntity } from '@d19n/models/dist/notifications/sendgrid/email/sendgrid.email.entity';
import {
  CREATE_DB_RECORD_ASSOCIATIONS,
  SUB_CREATE_DB_RECORDS,
  SUB_SEND_DYNAMIC_EMAIL,
} from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import { DbRecordAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/association/dto/db.record.association.create.update.dto';
import { DbRecordEntity } from '@d19n/models/dist/schema-manager/db/record/db.record.entity';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { IDbRecordCreateUpdateRes } from '@d19n/models/dist/schema-manager/db/record/interfaces/interfaces';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { SearchQueryTypeHttp } from '@d19n/models/dist/search/search.query.type.http';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Parser } from 'json2csv';
import moment from 'moment';
import { S3_BUCKET_NAME_FOR_ORG_FILES } from '../common/Constants';
import { BucketsService } from '../files/awsS3/buckets/buckets.service';
import { LogsUserActivityService } from '../logs/user-activity/logs.user.activity.service';
import { SchemasService } from '../schemas/schemas.service';
import { IGetManyRecordsByIdsParams, IMethodOptions } from './interfaces/interfaces';
import { DbRecordsAssociationsService } from './records/associations/db.records.associations.service';
import { DbRecordsService } from './records/db.records.service';
import { DbSearchService } from './search/db.search.service';
import { DbRecordDeleted } from './types/db.record.deleted';
import { DbRecordMergeDto } from './types/db.record.merge.dto';

const { NOTIFICATION_MODULE } = SchemaModuleTypeEnums;

export interface DbRecordQueueResponse {

  date: string,
  queued: number,
  query: any

}

export interface IGetCsvFields {
  value: string,
  label: string,

}

export interface ICsvFields {
  fields?: IGetCsvFields[],
  manyToOneEntities?: string[]
}

@Injectable()
export class DbService {

  public constructor(
    @Inject(forwardRef(() => BucketsService)) private bucketsService: BucketsService,
    @Inject(forwardRef(() => DbRecordsService)) private dbRecordsService: DbRecordsService,
    @Inject(forwardRef(() => DbRecordsAssociationsService)) private dbRecordsAssociationsService: DbRecordsAssociationsService,
    @Inject(forwardRef(() => DbSearchService)) private dbSearchService: DbSearchService,
    @Inject(forwardRef(() => SchemasService)) private schemasService: SchemasService,
    @Inject(forwardRef(() => LogsUserActivityService)) private logsUserActivityService: LogsUserActivityService,
    private amqpConnection: AmqpConnection,
  ) {

    this.logsUserActivityService = logsUserActivityService;
    this.schemasService = schemasService;
    this.dbRecordsService = dbRecordsService;
    this.dbRecordsAssociationsService = dbRecordsAssociationsService;
    this.dbSearchService = dbSearchService;
    this.amqpConnection = amqpConnection;

  }

  /**
   * search all db records
   * @param principal
   * @param query
   */
  public async searchDbRecordsByPrincipal(
    principal: OrganizationUserEntity,
    query: SearchQueryTypeHttp,
  ): Promise<any> {
    return await this.dbSearchService.searchByPrincipal(principal, query);
  }

  /**
   * search all db records
   * @param principal
   * @param query
   * @param file
   * @param entityName
   */
  public async searchDbRecordsByPrincipalWithFileSupport(
    principal: OrganizationUserEntity,
    query: SearchQueryTypeHttp,
    file?: boolean,
    entityName?: string,
    userFields?: string,
  ): Promise<any> {
    try {
      const response = await this.dbSearchService.searchByPrincipal(principal, query);
      if(!file) {
        return response
      }
      const csv = await this.getCsv(principal, query.schemas, response.data, userFields)
      const bucketName = S3_BUCKET_NAME_FOR_ORG_FILES
      const pathName = `${process.env.MODULE_NAME}/${entityName}_${Date.now()}.csv`
      const result = await this.bucketsService.putObjectToS3(principal, bucketName, pathName, csv)
      const presignedUrl = await this.bucketsService.getPresignedUrl(principal, bucketName, pathName)
      await this.sendEmail(principal, presignedUrl, entityName)
      if(response.data.length >= 1000) {
        return { sentToEmail: true }
      }
      return csv
    } catch (e) {
      console.error(e)
      throw e
    }
  }


  /**
   *
   * @private
   * @param {OrganizationUserEntity} principal
   * @param {string} presignedUrl
   * @param {string} entityName
   * @memberof DbService
   */
  private async sendEmail(principal: OrganizationUserEntity, presignedUrl: string, entityName: string) {
    const newEmail = new SendgridEmailEntity();
    newEmail.to = [
      principal.email,
    ];
    newEmail.templateLabel = 'SENDGRID_TEXT_EMAIL'
    newEmail.dynamicTemplateData = {
      subject: `Link to download file with ${entityName} data`,
      body: presignedUrl,
    };
    await this.amqpConnection.publish(
      NOTIFICATION_MODULE,
      `${NOTIFICATION_MODULE}.${SUB_SEND_DYNAMIC_EMAIL}`,
      {
        principal,
        body: newEmail,
      },
    )
  }

  private filterAllFields(allFields: IGetCsvFields[], fieldsFromUser: string): IGetCsvFields[] {
    fieldsFromUser = fieldsFromUser.replace('stageName', 'stage.name')
    fieldsFromUser = fieldsFromUser.replace(/dbRecords/g, 'dbRecords[0]')
    const filterArray = fieldsFromUser.split(',')
    const finalFields = allFields.filter(field => {
      for(let i = 0; i < filterArray.length; i++) {
        if(field.value.startsWith(filterArray[i])) {
          return true
        }
      }
      return false
    })
    return finalFields
  }

  private transformOneToMany(
    dbRecords: DbRecordEntityTransform[],
    manyToOneEntities: string[],
  ): DbRecordEntityTransform[] {
    let items = dbRecords
    manyToOneEntities.forEach(prop => {
      const newItems = items.map(dbRecord => {
        const newRecordArray = []
        if(dbRecord[prop]?.dbRecords?.length > 1) {
          for(let i = 0; i < dbRecord[prop]?.dbRecords?.length; i++) {
            const newdbRecord = {
              ...dbRecord,

            }
            newdbRecord[prop] = {
              dbRecords: [ dbRecord[prop]?.dbRecords[i] ],
            }
            newRecordArray.push(newdbRecord)
          }
        } else {
          newRecordArray.push(dbRecord)
        }
        return newRecordArray
      })
      items = newItems.flat()
    })
    return items

  }

  private generateNewLabel(label:string):string{
    let labelArray = label.split('.')
    if(labelArray.length>1){
      labelArray=[ labelArray[0],labelArray[labelArray.length-1] ]
      label = labelArray.join('.')
    }
    return label
  }

  private getFieldsFromSchema(schema, prefix = ''): ICsvFields {
    let fields: IGetCsvFields[] = []
    const additionalFields = [ 'title', 'recordNumber', 'createdAt', 'createdBy.fullName', 'updatedAt', 'deletedAt', 'stage.name' ]
    const manyToOneEntities = []
    additionalFields.forEach(field => {
      const newField = {
        label: this.generateNewLabel(`${prefix}${field}`),
        value: `${prefix}${field}`,
      }
      fields.push(newField)
    })
    for(const prop in schema) {
      if(prop === 'columns') {
        const columns = schema.columns.map(col => {

          const newField = {
            label: this.generateNewLabel(`${prefix}properties.${col.name}`),
            value: `${prefix}properties.${col.name}`,
          }
          return newField
        })
        fields = [ ...fields, ...columns ]
      } else if(prop === 'associations') {
        schema.associations.forEach(association => {
          if(association.childSchema) {
            if(association.type === 'ONE_TO_MANY') {
              manyToOneEntities.push(association.childSchema.entityName)
            }
            const { fields: linkedEntentyFields } = this.getFieldsFromSchema(
              association.childSchema,
              `${association.childSchema.entityName}.dbRecords[0].`,
            )
            fields = [ ...fields, ...linkedEntentyFields ]
          }
        })
      }
    }
    return { fields, manyToOneEntities }
  }

  private async getCsv(
    principal: OrganizationUserEntity,
    schemas: string,
    items: any[],
    fieldsFromUser?: string,
  ): Promise<string> {
    const schema = await this.schemasService.getFullSchemaByOrganizationAndIdWithAssociations(
      principal.organization,
      { schemaId: schemas },
    );
    const result = this.getFieldsFromSchema(schema)
    let manyToOneEntities = result.manyToOneEntities
    let fields = result.fields
    if(fieldsFromUser) {

      fields = this.filterAllFields(fields, fieldsFromUser)
    }
    // fields
    manyToOneEntities = manyToOneEntities.filter(manyToOneEntity => {
      fields.forEach(field => {
        if(field.value.startsWith(manyToOneEntity)) {
          return true
        }
      })
    })
    if(manyToOneEntities.length) {
      items = this.transformOneToMany(items, manyToOneEntities)
    }

    const json2csv = new Parser({ fields });
    const csv = json2csv.parse(items);
    return csv
  }


  /**
   * update or create many db records
   * @param principal
   * @param body
   * @param query
   */
  public async batchCreate(
    principal: OrganizationUserEntity,
    body: DbRecordCreateUpdateDto[],
    query?: { skipRelate?: boolean, upsert?: boolean, queue?: boolean, queueAndRelate?: boolean },
  ): Promise<IDbRecordCreateUpdateRes[] | DbRecordQueueResponse> {
    try {

      if(body.length > 100) {
        throw new ExceptionType(500, 'maximum batch creates is 100 records');
      }

      if(query.queue) {
        // if the user wants to queue all records

        for(const item of body) {

          this.amqpConnection.publish(
            process.env.MODULE_NAME,
            `${process.env.MODULE_NAME}.${SUB_CREATE_DB_RECORDS}`,
            {
              principal: principal,
              body: [ item ],
              query,
            },
          );

        }

        return {
          date: moment().toISOString(),
          queued: body.length,
          query,
        }

      } else if(query.queueAndRelate) {
        // if the user wants to queue the records and relate them all based on
        // schema associations we will queue the entire payload.
        this.amqpConnection.publish(
          process.env.MODULE_NAME,
          `${process.env.MODULE_NAME}.${SUB_CREATE_DB_RECORDS}`,
          {
            principal: principal,
            body,
            query,
          },
        );

        return {
          date: moment().toISOString(),
          queued: body.length,
          query,
        }

      } else {

        return await this.updateOrCreateDbRecordsByPrincipal(principal, body, query);

      }
    } catch (e) {
      console.error(e);
      throw new ExceptionType(e.statusCode, e.message, e.validation, e.data);
    }
  }

  /**
   * update or create many db records
   *
   * @param principal
   * @param body
   * @param query
   */
  public async updateOrCreateDbRecordsByPrincipal(
    principal: OrganizationUserEntity,
    body: DbRecordCreateUpdateDto[],
    query?: { skipRelate?: boolean, upsert?: boolean },
  ): Promise<IDbRecordCreateUpdateRes[]> {
    try {

      const skipRelate = query && query.skipRelate;

      const trace = await tracer.startSpan('updateOrCreateDbRecordsByPrincipal');

      const records = [];
      for(let i = 0; i < body.length; i++) {

        const res = await this.dbRecordsService.updateOrCreateDbRecords(
          principal,
          body[i],
          { tracerParent: trace },
        );

        records.push(res);
      }

      // if skipRelate is true we should not try to create relations for new records
      // default is true
      if(!skipRelate) {

        await this.associateCreatedDbRecords(principal, records, { tracerParent: trace });

      }

      trace.finish();

      return records;

    } catch (e) {
      console.error(e);
      throw new ExceptionType(e.statusCode, e.message, e.validation, e.data);
    }
  }

  /**
   * update a single db record
   * @param principal
   * @param recordId
   * @param body
   */
  public async updateDbRecordsByPrincipalAndId(
    principal: OrganizationUserEntity,
    recordId: string,
    body: DbRecordCreateUpdateDto,
  ): Promise<IDbRecordCreateUpdateRes> {
    try {

      return await this.dbRecordsService.updateDbRecordById(principal, recordId, body);

    } catch (e) {
      console.error(e);
      throw new ExceptionType(e.statusCode, e.message, e.validation, e.data);
    }
  }

  /**
   *
   * @param organization
   * @param recordId
   * @param options
   */
  public async getManyDbRecordsByOrganizationAndIds(
    organization: OrganizationEntity,
    params: IGetManyRecordsByIdsParams,
    options?: IMethodOptions,
  ): Promise<DbRecordEntity[]> {
    try {
      const trace = tracer.startSpan(
        'getManyDbRecordsByOrganizationAndIds',
        { childOf: options && options.tracerParent ? options.tracerParent.context() : undefined },
      );

      const record = await this.dbRecordsService.getManyDbRecordsByIds(organization, params, { tracerParent: trace });

      trace.finish();

      return record;
    } catch (e) {
      console.error(e);
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }


  /**
   *
   * @param organization
   * @param recordId
   * @param options
   */
  public async getDbRecordsByOrganizationAndId(
    organization: OrganizationEntity,
    recordId: string,
    options?: IMethodOptions,
  ): Promise<DbRecordEntity> {
    try {

      const trace = tracer.startSpan(
        'getDbRecordsByOrganizationAndId',
        { childOf: options && options.tracerParent ? options.tracerParent.context() : undefined },
      );

      const record = await this.dbRecordsService.getDbRecordById(organization, recordId, { tracerParent: trace });

      trace.finish();

      return record;

    } catch (e) {
      console.error(e);
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }

  /**
   * Returns the record using an externalId with associations
   * Used when we want the record with associations
   * @param organization
   * @param externalId
   * @param entities
   */
  public async getDbRecordTransformedByOrganizationAndExternalId(
    principal: OrganizationEntity | OrganizationUserEntity,
    externalId: string,
    entities?: string[],
  ) {
    try {

      let organization=principal
      if(principal instanceof OrganizationUserEntity){
        organization = principal.organization
      } 

      const record = await this.dbRecordsService.getDbRecordByExternalId(principal, externalId);

      if(!record) {
        throw new ExceptionType(404, `could not locate db record with external id ${externalId}`);
      }

      const schema = await this.schemasService.getSchemaByOrganizationAndId(
        organization,
        { schemaId: record.schemaId },
      );

      // filter the schema columns by schemaTypeId
      if(record.schemaTypeId) {
        schema.columns = schema.columns.filter(elem => elem.schemaTypeId === record.schemaTypeId || !elem.schemaTypeId);
      }

      const transformed = DbRecordEntityTransform.transform(record, schema);

      const associations = await this.dbRecordsAssociationsService.getRelatedRecordsByEntity(
        organization,
        {
          recordId: record.id,
          entities,
        },
      );

      return Object.assign({}, transformed, associations ? associations : {});

    } catch (e) {
      console.error(e);
      throw new ExceptionType(e.statusCode, e.message, e.validation, e.data);
    }
  }

  /**
   * Returns the record with associations
   * Used when we want the record with associations
   * @param organization
   * @param recordId
   * @param entities
   * @param filters
   */
  public async getDbRecordTransformedByOrganizationAndId(
    principal: OrganizationEntity|OrganizationUserEntity,
    recordId: string,
    entities?: string[],
    filters?: string[],
  ) {

    try {

      let organization=principal
      if(principal instanceof OrganizationUserEntity){
        organization = principal.organization
      } 
      
      const trace = await tracer.startSpan('getDbRecordTransformedByOrganizationAndId');

      const record = await this.dbRecordsService.getDbRecordById(principal, recordId);
      const schema = await this.schemasService.getSchemaByOrganizationAndId(
        organization,
        { schemaId: record.schemaId },
      );

      // filter the schema columns by schemaTypeId
      if(record.schemaTypeId) {
        schema.columns = schema.columns.filter(elem => elem.schemaTypeId === record.schemaTypeId || !elem.schemaTypeId);
      }

      const transformed = DbRecordEntityTransform.transform(record, schema);

      const associations = await this.dbRecordsAssociationsService.getRelatedRecordsByEntity(
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

      trace.finish();

      return Object.assign({}, transformed, associations ? associations : {});

    } catch (e) {
      console.error(e);
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }

  /**
   *
   * @param principal
   * @param ids
   */
  public async getManyDbRecordTransformedByOrganizationAndId(principal: OrganizationEntity|OrganizationUserEntity, ids: any) {
    try {

      const data = [];

      if(ids) {

        let organization=principal
        if(principal instanceof OrganizationUserEntity){
          organization = principal.organization
        } 

        const records = await this.dbRecordsService.getManyDbRecordsByIds(principal, { recordIds: ids.split(',') });

        for(const record of records) {

          const schema = await this.schemasService.getSchemaByOrganizationAndId(
            organization,
            { schemaId: record.schemaId },
          );

          // filter the schema columns by schemaTypeId
          if(record.schemaTypeId) {
            schema.columns = schema.columns.filter(elem => elem.schemaTypeId === record.schemaTypeId || !elem.schemaTypeId);
          }

          const transformed = DbRecordEntityTransform.transform(record, schema);

          data.push(transformed);

        }
      }

      return data;

    } catch (e) {

      console.error(e)

    }
  }

  /**
   * Returns the record transformed
   * @param organization
   * @param recordId
   */
  public async getDeletedDbRecordById(
    organization: OrganizationEntity,
    recordId: string,
  ): Promise<DbRecordEntityTransform> {

    try {

      const trace = await tracer.startSpan('getDeletedDbRecordById');

      const record = await this.dbRecordsService.getDeletedDbRecordById(organization, recordId);
      const schema = await this.schemasService.getSchemaByOrganizationAndId(
        organization,
        { schemaId: record.schemaId },
      );

      // filter the schema columns by schemaTypeId
      if(record.schemaTypeId) {
        schema.columns = schema.columns.filter(elem => elem.schemaTypeId === record.schemaTypeId || !elem.schemaTypeId);
      }

      trace.finish();

      return DbRecordEntityTransform.transform(record, schema);

    } catch (e) {
      console.error(e);
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }


  /**
   *
   * @param principal
   * @param recordId
   * @param excludedDeletes
   */
  public async deleteByPrincipalAndId(
    principal: OrganizationUserEntity,
    recordId: string,
    excludedDeletes?: string[],
  ): Promise<DbRecordDeleted[]> {
    try {
      const cascadeDeletes = await this.dbRecordsService.deleteDbRecordById(principal, recordId, excludedDeletes);
      return [ ...cascadeDeletes ];
    } catch (e) {
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }

  /**
   * this method will look for relation ships between the records created and create relations
   * where there is one.
   * @param principal
   * @param records
   */
  private async associateCreatedDbRecords(
    principal: OrganizationUserEntity,
    records: { id: string }[],
    options?: IMethodOptions,
  ) {

    if(records.length < 2) {
      return;
    }

    for(const record of records) {
      const associationsToCreate: DbRecordAssociationCreateUpdateDto[] = [];
      // remove the the owning record from the array
      const filtered = records.filter(elem => elem.id !== record.id);

      if(filtered && filtered.length > 0) {
        for(const recordAssoc of filtered) {
          const dbRecordAssociationCreateUpdateDto = new DbRecordAssociationCreateUpdateDto();
          dbRecordAssociationCreateUpdateDto.recordId = recordAssoc.id;
          associationsToCreate.push(dbRecordAssociationCreateUpdateDto);
        }

        this.amqpConnection.publish(
          process.env.MODULE_NAME,
          `${process.env.MODULE_NAME}.${CREATE_DB_RECORD_ASSOCIATIONS}`,
          {
            principal: principal,
            id: record.id,
            body: associationsToCreate,
          },
        );
      }
    }
  }

  /**
   *
   * @param organization
   * @param body
   */
  public async mergeRecordsByOrganization(
    principal: OrganizationUserEntity,
    body: DbRecordMergeDto,
  ): Promise<IDbRecordCreateUpdateRes> {

    try {
      const associations = body.associations;
      const properties = body.properties;

      const masterRecord = await this.getDbRecordTransformedByOrganizationAndId(
        principal,
        body.masterRecordId,
        [],
      );

      const mergeRecord = await this.getDbRecordTransformedByOrganizationAndId(
        principal,
        body.mergeRecordId,
        [],
      );

      // throw an error if the two records are not from the same schema
      if(masterRecord.schemaId !== mergeRecord.schemaId) {
        throw new ExceptionType(400, 'the master record and merge record must be from the same schema');
      }
      const update = new DbRecordCreateUpdateDto();
      update.associations = associations || [];
      // This will override the merge record properties with properties from the master
      if(properties) {
        update.schemaId = masterRecord.schemaId;
        update.properties = Object.assign({}, masterRecord.properties, mergeRecord.properties, properties);
      } else {
        update.schemaId = masterRecord.schemaId;
        update.properties = Object.assign({}, masterRecord.properties, mergeRecord.properties);
      }

      // Update the master record
      const res = await this.updateDbRecordsByPrincipalAndId(principal, masterRecord.id, update);

      // If the response is successful delete the merge record
      if(res) {

        const excludedDeletes = body.associations ? body.associations.map(elem => elem.recordId) : undefined;
        await this.deleteByPrincipalAndId(principal, mergeRecord.id, excludedDeletes);

      }

      await this.logsUserActivityService.createByPrincipal(
        principal,
        masterRecord.id,
        { masterRecord, mergeRecord, body },
        LogsConstants.DB_RECORD_MERGED,
      );

      return res;

    } catch (e) {
      console.error(e)
    }
  }

}
