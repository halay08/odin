import { OrganizationEntity } from '@d19n/models/dist/identity/organization/organization.entity';
import { Inject, Injectable } from '@nestjs/common';
import { RedisClient } from '../common/RedisClient';

@Injectable()
export class DbCacheService {

  private readonly redisService: RedisClient;

  public constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: any,
  ) {
    this.redisService = new RedisClient(redisClient);
  }

  /**
   *
   * @param cacheKey
   */
  public async getFromCache<T>(cacheKey: string) {
    const cached = await this.redisService.getFromCache<T>(cacheKey);
    if(cached) {
      return cached;
    }
  }

  /**
   *
   * @param cacheKey
   * @param data
   */
  public async saveToCache<T>(cacheKey, data: any) {

    await this.redisService.saveToCache<T>(cacheKey, data);

  }

  /**
   * for DbService, DbRecordService, DbRecordAssociationService
   * @param organization
   * @param recordId
   */
  public async clearRecordsFromCache(organization: OrganizationEntity, recordId: string) {
    const cacheKey1 = `__FILE.METHOD_NAME__-${organization.id}-${recordId}`;
    const cacheKey2 = `__FILE.METHOD_NAME__-${organization.id}-${recordId}`;

    const processAsync = [];
    return await Promise.all(processAsync.map(elem => elem.func)).then(res => res);
  }

  /**
   * For SchemaService
   * @param organization
   * @param recordId
   */
  public async clearSchemasFromCache(organization: OrganizationEntity, id: string) {

    const cacheKey1 = `schemaService-getSchemaByOrganizationAndIdWithAssociationsTransformed-${organization.id}-${id}`;
    const cacheKey2 = `schemaService-getSchemaByOrganizationAndId-${organization.id}-${id}`;
    const cacheKey3 = `schemaService-getSchemaByOrganizationAndEntity-${organization.id}-${id}`;
    const cacheKey4 = `schemaService-getSchemaByOrganizationAndModuleAndEntity-${organization.id}-${id}`;
    const cacheKey5 = `schemaService-getSchemaByOrganizationAndIdWithAssociations-${organization.id}-${id}`;
    const cacheKey6 = `schemaService-getFullSchemaByOrganizationAndModuleAndEntity-${organization.id}-${id}`;

    const cacheKey7 = `schemaColumnsService-getSchemaColumnsByOrganizationAndSchemaId-${organization.id}-${id}`;

    console.log('clear cached schema')

    // Add caching
    const processAsync = [
      { func: this.redisService.removeFromCache(cacheKey1) },
      { func: this.redisService.removeFromCache(cacheKey2) },
      { func: this.redisService.removeFromCache(cacheKey3) },
      { func: this.redisService.removeFromCache(cacheKey4) },
      { func: this.redisService.removeFromCache(cacheKey5) },
      { func: this.redisService.removeFromCache(cacheKey6) },
      { func: this.redisService.removeFromCache(cacheKey7) },
    ];

    return await Promise.all(processAsync.map(elem => elem.func)).then(res => res).catch(e => console.error(e));

  }

}
