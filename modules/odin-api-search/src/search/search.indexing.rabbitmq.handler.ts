import { INDEX_DB_RECORDS } from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import { IIndexDbRecords } from '@d19n/models/dist/rabbitmq/rabbitmq.interfaces';
import { ELASTIC_SEARCH_CLIENT } from '@d19n/schema-manager/dist/common/Constants';
import { DbService } from '@d19n/schema-manager/dist/db/db.service';
import { DbRecordsAssociationsService } from '@d19n/schema-manager/dist/db/records/associations/db.records.associations.service';
import { DbSearchService } from '@d19n/schema-manager/dist/db/search/db.search.service';
import { SchemasService } from '@d19n/schema-manager/dist/schemas/schemas.service';
import { Client } from '@elastic/elasticsearch';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ElasticSearchClient } from 'src/common/ElasticSearchClient';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';


@Injectable()
export class SearchIndexingRabbitmqHandler {

    private readonly elasticSearchClient: ElasticSearchClient;
    protected readonly dbRecordsAssociationsService: DbRecordsAssociationsService;
    protected readonly dbService: DbService;
    protected readonly dbSearchService: DbSearchService;
    protected readonly schemasService: SchemasService;

    constructor(
        @Inject(ELASTIC_SEARCH_CLIENT) public readonly esClient: Client,
        @Inject(forwardRef(() => DbRecordsAssociationsService)) dbRecordsAssociationsService: DbRecordsAssociationsService,
        @Inject(forwardRef(() => DbService)) dbService: DbService,
        schemasService: SchemasService,
        dbSearchService: DbSearchService,
    ) {
        this.elasticSearchClient = new ElasticSearchClient(esClient);
        this.dbSearchService = dbSearchService;
        this.dbRecordsAssociationsService = dbRecordsAssociationsService;
        this.dbService = dbService;
        this.schemasService = schemasService;
    }


    /**
     *
     * @param msg
     * @private
     */
    @RabbitSubscribe({
        exchange: process.env.MODULE_NAME,
        routingKey: `${process.env.MODULE_NAME}.${INDEX_DB_RECORDS}`,
        queue: `${process.env.MODULE_NAME}.${INDEX_DB_RECORDS}`,
    })
    private async handleReIndexingRecordCreated(msg: IIndexDbRecords) {

        try {
            msg.principal = Object.assign(new OrganizationUserEntity,  msg.principal);
            console.log('reindex search', msg);
            for(const record of msg.body) {
                // Handle message
                // We need to load the full schema associations (parent & child)
                console.log('record.schemaId', record.schemaId);
                const { associations } = await this.schemasService.getSchemaByOrganizationAndIdWithAssociationsTransformed(
                    msg.principal.organization,
                    { schemaId: record.schemaId },
                );

                let entities = [];
                for(const association of associations) {
                    if(association.childSchema) {
                        entities.push(association.childSchema.entityName);
                    }
                }

                const recordWithAssociations = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                    msg.principal,
                    record.id,
                    entities,
                );

                const res = await this.elasticSearchClient.syncReplace(
                    recordWithAssociations,
                    record.id,
                    record.schemaId,
                );
                console.log('res', res);
            }
        } catch (e) {
            console.error(e);
        }

    }

    //
    //
    // /**
    //  *
    //  * @param msg
    //  * @private
    //  */
    // @RabbitSubscribe({
    //     exchange: process.env.MODULE_NAME,
    //     routingKey: `${process.env.MODULE_NAME}.*.${SUB_DB_RECORD_DELETED}`,
    //     queue: RECORD_DELETED_QUEUE,
    //     errorHandler: this.handleError,
    // })
    // private async handleReIndexingRecordDeleted(msg: IDbRecordDeleted) {
    //
    //     console.log('handleReIndexingRecordDeleted message received ', msg);
    //     // Handle message
    //     if(msg.event === LogsConstants.DB_RECORD_DELETED) {
    //         await this.dbSearchService.deleteRecordFromSearchDatabase(
    //             msg.dbRecord.id,
    //             msg.dbRecord.schemaId,
    //         );
    //     }
    // }

}
