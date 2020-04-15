import { OrganizationEntity } from '@d19n/models/dist/identity/organization/organization.entity';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbRecordAssociationEntity } from '@d19n/models/dist/schema-manager/db/record/association/db.record.association.entity';
import { DbRecordAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/association/dto/db.record.association.create.update.dto';
import { Injectable } from '@nestjs/common';
import {
  ICreateDbRecordAssociations,
  IGetDbRecordAssociation,
  IGetDbRecordAssociationBySchema,
  IGetDbRecordAssociationChildRecordIds,
  IGetDbRecordAssociationParentRecordIds,
  IMethodOptions,
  IUpdateDbRecordAssociation,
} from '../../interfaces/interfaces';
import {
  DbRecordAssociationDeleteResult,
  DbRecordsAssociationsServiceInternal,
} from './db.records.associations.service.internal';


@Injectable()
export class DbRecordsAssociationsService {

  public constructor(
    private readonly dbRecordsAssociationsService: DbRecordsAssociationsServiceInternal,
  ) {

    this.dbRecordsAssociationsService = dbRecordsAssociationsService;

  }

  /**
   * Use this to create relationship between one or many records
   *
   * @param principal
   * @param params
   * @param options
   */
  public async createRelatedRecords(principal, params: ICreateDbRecordAssociations, options?: IMethodOptions) {

    return await this.dbRecordsAssociationsService._createRelatedRecords(principal, params, options);

  }

  /**
   * Use this to get a record that has column mappings
   * fetched using the recordId you want to get and the
   * associationId
   *
   * @param organization
   * @param params
   * @param options
   */
  public async getRelatedRecordById(
    organization: OrganizationEntity,
    params: IGetDbRecordAssociation,
    options?: IMethodOptions,
  ) {

    return await this.dbRecordsAssociationsService._getRelatedRecordById({ organization: organization, params: params, options: options });

  }

  /**
   *
   * @param organization
   * @param parentRecordId
   * @param childRecordId
   */
  public async getRelatedRecordByParentAndChildId(
    organization: OrganizationEntity,
    parentRecordId: string,
    childRecordId: string,
  ) {

    return await this.dbRecordsAssociationsService._getRelatedRecordByParentAndChildId(
      organization,
      parentRecordId,
      childRecordId,
    );

  }

  /**
   * Use this when you want to get the records parent record ids
   *
   * @param organization
   * @param params
   * @param options
   */
  public async getRelatedParentRecordIds(
    organization: OrganizationEntity,
    params: IGetDbRecordAssociationParentRecordIds,
    options?: IMethodOptions,
  ) {

    return await this.dbRecordsAssociationsService._getRelatedParentRecordIds(organization, params, options);

  }

  /**
   * Use this when you want to get the records child record ids
   *
   * @param organization
   * @param params
   * @param options
   */
  public async getRelatedChildRecordIds(
    organization: OrganizationEntity,
    params: IGetDbRecordAssociationChildRecordIds,
    options?: IMethodOptions,
  ) {

    return await this.dbRecordsAssociationsService._getRelatedChildRecordIds(organization, params, options);

  }

  /**
   * Use this when you want to get the records related records ( parent or child )
   * by entityName
   *
   * @param organization
   * @param params
   * @param options
   */
  public async getRelatedRecordsByEntity(
    organization: OrganizationEntity,
    params: IGetDbRecordAssociation,
    options?: IMethodOptions,
  ) {

    return await this.dbRecordsAssociationsService._getRelatedRecordsByEntity(organization, params, options);

  }

  /**
   * Use this when you want to get related records
   *
   * @param organization
   * @param params
   * @param options
   */
  public async lookUpRecordIdsAcrossRelations(
    organization: OrganizationEntity,
    params: IGetDbRecordAssociationBySchema,
    options?: IMethodOptions,
  ) {

    return await this.dbRecordsAssociationsService._lookUpRecordIdsAcrossRelations(organization, params, options);

  }

  /**
   *
   * @param principal
   * @param params
   * @param options
   */
  public async updateRelatedRecordById(
    principal: OrganizationUserEntity,
    params: IUpdateDbRecordAssociation,
    options?: IMethodOptions,
  ): Promise<DbRecordAssociationEntity> {

    return await this.dbRecordsAssociationsService._updateRelatedRecordById(principal, params, options);

  }


  /**
   *
   * @param principal
   * @param transferorId
   * @param transfereeId
   * @param body
   */
  public async transferRelatedRecords(
    principal: OrganizationUserEntity,
    transferorId: string,
    transfereeId: string,
    body: DbRecordAssociationCreateUpdateDto[],
  ) {

    return await this.dbRecordsAssociationsService._transferRelatedRecords(principal, transferorId, transfereeId, body);

  }

  /**
   *
   * @param principal
   * @param dbRecordId
   * @param options
   */
  public async deleteByRecordId(principal: OrganizationUserEntity, dbRecordId: string, options?: IMethodOptions) {

    return await this.dbRecordsAssociationsService._deleteByRecordId(principal, dbRecordId, options);

  }

  /**
   *
   * @param principal
   * @param dbRecordAssociationId
   * @param options
   */
  public async deleteRelatedRecordById(
    principal: OrganizationUserEntity,
    dbRecordAssociationId: string,
    options?: IMethodOptions,
  ): Promise<DbRecordAssociationDeleteResult> {

    return await this.dbRecordsAssociationsService._deleteByAssociationId(principal, dbRecordAssociationId);

  }

  /**
   *
   * @param principal
   * @param dbRecordAssociationIds
   * @param options
   */
  public async deleteManyByAssociationIds(
    principal: OrganizationUserEntity,
    dbRecordAssociationIds: string,
    options?: IMethodOptions,
  ): Promise<DbRecordAssociationDeleteResult[]> {

    return await this.dbRecordsAssociationsService._deleteManyByAssociationIds(principal, dbRecordAssociationIds);

  }

}
