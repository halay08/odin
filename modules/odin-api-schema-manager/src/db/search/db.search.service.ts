import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { INDEX_DB_RECORDS } from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import { SearchQueryTypeHttp } from '@d19n/models/dist/search/search.query.type.http';
import { SearchResponseType } from '@d19n/models/dist/search/search.response.type';
import { Client } from '@elastic/elasticsearch';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ELASTIC_SEARCH_CLIENT } from '../../common/Constants';
import { ElasticSearchClient } from '../../common/ElasticSearchClient';
import { SchemasService } from '../../schemas/schemas.service';
import { DbService } from '../db.service';
import { DbRecordsAssociationsService } from '../records/associations/db.records.associations.service';

@Injectable()
export class DbSearchService {

  private readonly elasticSearchClient: ElasticSearchClient;
  private readonly dbRecordsAssociationsService: DbRecordsAssociationsService;
  private readonly dbService: DbService;
  private readonly schemasService: SchemasService;
  private readonly amqpConnection: AmqpConnection;


  public constructor(
    @Inject(ELASTIC_SEARCH_CLIENT) public readonly esClient: Client,
    @Inject(forwardRef(() => DbRecordsAssociationsService)) dbRecordsAssociationsService: DbRecordsAssociationsService,
    @Inject(forwardRef(() => DbService)) dbService: DbService,
    @Inject(forwardRef(() => SchemasService)) schemasService: SchemasService,
    amqpConnection: AmqpConnection,
  ) {

    this.elasticSearchClient = new ElasticSearchClient(esClient);
    this.dbRecordsAssociationsService = dbRecordsAssociationsService;
    this.dbService = dbService;
    this.schemasService = schemasService;
    this.amqpConnection = amqpConnection;

  }

  /**
   *
   * @param principal
   * @param query
   */
  public async searchByPrincipal(
    principal: OrganizationUserEntity,
    query: SearchQueryTypeHttp,
  ): Promise<any> {
    try {
      if(!!query.findInSchema && !query.findInChildSchema) {

        query.schemas = query.findInSchema;
        return await this.elasticSearchClient.search(principal,query, query.schemas, false);

      } else if(!!query.recordId && !!query.findInSchema && !!query.findInChildSchema) {

        return await this.searchAcrossRecordAssociations(principal, query);

      } else {

        return await this.elasticSearchClient.search(principal,query, query.schemas || '*', false);

      }
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  /**
   *
   * @param principal
   * @param query
   */
  private async searchAcrossRecordAssociations(principal: OrganizationUserEntity, query: SearchQueryTypeHttp) {

    const recordIds = await this.dbRecordsAssociationsService.lookUpRecordIdsAcrossRelations(
      principal.organization,
      {
        recordId: query.recordId,
        findInSchema: query.findInSchema,
        findInChildSchema: query.findInChildSchema,
      },
    );

    const schemaId = query.findInSchema && !query.findInChildSchema ? query.findInSchema : query.findInChildSchema;

    query.boolean = JSON.stringify({
      must: [
        {
          'terms': {
            '_id': recordIds,
          },
        },
      ],
      must_not: [],
      should: [],
      filter: [],
    });

    query.schemas = schemaId;

    if(recordIds.length < 1) {
      return new SearchResponseType(query, 0, { data: [] }, []);
    }
    return await this.elasticSearchClient.search(principal,query, schemaId, false);
  }

  /**
   *
   * @param principal
   * @param recordId
   * @param schemaId
   */
  public async reIndexSearchDatabaseForRecord(
    principal: OrganizationUserEntity,
    recordId: string,
    schemaId: string,
  ) {

    try {

      this.amqpConnection.publish(
        'SearchModule',
        `SearchModule.${INDEX_DB_RECORDS}`,
        {
          principal: principal,
          body: [
            {
              id: recordId,
              schemaId: schemaId,
            },
          ],
        },
      );

    } catch (e) {
      console.error(e);
    }
  }


  /**
   *
   * @param recordId
   * @param schemaId
   */
  public async deleteRecordFromSearchDatabase(recordId: string, schemaId: string) {
    const res = await this.elasticSearchClient.deleteById(recordId, schemaId);
    return res;
  }
}
