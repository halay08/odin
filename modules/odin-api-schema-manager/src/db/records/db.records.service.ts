import { OrganizationEntity } from '@d19n/models/dist/identity/organization/organization.entity';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbRecordEntity } from '@d19n/models/dist/schema-manager/db/record/db.record.entity';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { IDbRecordCreateUpdateRes } from '@d19n/models/dist/schema-manager/db/record/interfaces/interfaces';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { Injectable } from '@nestjs/common';
import { IGetManyRecordsByIdsParams, IMethodOptions } from '../interfaces/interfaces';
import { DbRecordDeleted } from '../types/db.record.deleted';
import { DbRecordsServiceInternal } from './db.records.service.internal';
import { DbRecordsPrincipalServiceInternal } from './db.records.service.internal.v2';

export class dbRecordServiceOptions {
  public upsert: boolean = true;
}


@Injectable()
export class DbRecordsService {

  public constructor(
    private readonly dbRecordsServiceInternal: DbRecordsServiceInternal,
    private readonly dbRecordsPrincipalServiceInternal: DbRecordsPrincipalServiceInternal,
  ) {

    this.dbRecordsServiceInternal = dbRecordsServiceInternal;
    this.dbRecordsPrincipalServiceInternal = dbRecordsPrincipalServiceInternal;

  }

  /**
   * @param principal
   * @param params
   * @param options
   */
  public async getManyDbRecordsByIds(
    principal: OrganizationEntity| OrganizationUserEntity,
    params: IGetManyRecordsByIdsParams,
    options?: IMethodOptions,
  ): Promise<DbRecordEntity[]> {

    if(principal instanceof OrganizationUserEntity){
      return await this.dbRecordsPrincipalServiceInternal._getManyDbRecordsByIds(principal, params, options);
    }

    return await this.dbRecordsServiceInternal._getManyDbRecordsByIds(principal, params, options);

  }


  /**
   * @param principal
   * @param recordId
   * @param options
   */
  public async getDbRecordById(
    principal: OrganizationEntity|OrganizationUserEntity,
    recordId: string,
    options?: IMethodOptions,
  ) {


    if(principal instanceof OrganizationUserEntity){
      return await this.dbRecordsPrincipalServiceInternal._getDbRecordById(principal, { recordId }, options);
    }
    return await this.dbRecordsServiceInternal._getDbRecordById(
      principal,
      { recordId },
      options,
    );
  }

  /**
   * @param organization
   * @param recordId
   * @param options
   */
  public async getDeletedDbRecordById(
    organization: OrganizationEntity,
    recordId: string,
    options?: IMethodOptions,
  ) {
    return await this.dbRecordsServiceInternal._getDeletedDbRecordById(
      organization,
      { recordId },
      options,
    );

  }


  /**
   * Get a record using the externalId
   * @param principal
   * @param recordId
   */
  public async getDbRecordByExternalId(principal: OrganizationEntity|OrganizationUserEntity, externalId: string): Promise<DbRecordEntity> {

    if(principal instanceof OrganizationUserEntity){
      return await this.dbRecordsPrincipalServiceInternal._getDbRecordByExternalId(principal, { externalId });
    }

    return await this.dbRecordsServiceInternal._getDbRecordByExternalId(
      principal,
      { externalId },
    );

  }

  /**
   *
   * @param organization
   * @param params
   * @param options
   */
  public async getDbRecordBySchemaAndValues(
    organization: OrganizationEntity,
    params: {
      schema: SchemaEntity,
      query: { id: string, value: string | number }[],
      schemaTypeId?: string,
      title?: string,
    },
    options?: IMethodOptions,
  ): Promise<{ record_id: string }> {

    return await this.dbRecordsServiceInternal._getDbRecordBySchemaAndValues(
      organization,
      params.schema,
      params.query,
      params.schemaTypeId,
      params.title,
    );

  }


  /**
   *
   * @param organization
   * @param params
   * @param options
   */
  public async getDbRecordsByColumnAndValues(
    organization: OrganizationEntity,
    params: {
      schemaColumnId: string,
      values: string[],
      schemaTypeId?: string,
    },
    options?: IMethodOptions,
  ): Promise<DbRecordEntity[]> {

    return await this.dbRecordsServiceInternal._getDbRecordsByColumnAndValues(organization, params, options);

  }

  /**
   * This method is intended to be used when creating records with all the records
   * required properties.
   *
   * @param principal
   * @param body
   * @param options
   */
  public async updateOrCreateDbRecords(
    principal: OrganizationUserEntity,
    body: DbRecordCreateUpdateDto,
    options?: IMethodOptions,
  ): Promise<IDbRecordCreateUpdateRes> {

    return await this.dbRecordsServiceInternal._updateOrCreateDbRecords(principal, body, options);

  }

  /**
   * update an existing record
   * @param principal
   * @param recordId
   * @param body
   * @param options
   */
  public async updateDbRecordById(
    principal: OrganizationUserEntity,
    recordId: string,
    body: DbRecordCreateUpdateDto,
    options?: IMethodOptions,
  ): Promise<IDbRecordCreateUpdateRes> {

    return await this.dbRecordsServiceInternal._updateDbRecordById(principal, recordId, body, options);

  }

  /**
   * we soft delete the record to allow aggregation methods / processes to run and restoring
   * in the event of accidental delete.
   * @param principal
   * @param recordId
   * @param excludedDeletes
   */
  public async deleteDbRecordById(principal: OrganizationUserEntity, recordId: string, excludedDeletes?: string[],
  ): Promise<DbRecordDeleted[]> {

    return await this.dbRecordsServiceInternal._deleteDbRecordById(principal, recordId, excludedDeletes);

  }
}
