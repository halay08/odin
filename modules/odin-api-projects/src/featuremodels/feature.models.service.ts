import { DbService } from '@d19n/schema-manager/dist/db/db.service';
import { DbRecordsAssociationsService } from '@d19n/schema-manager/dist/db/records/associations/db.records.associations.service';
import { DbRecordsService } from '@d19n/schema-manager/dist/db/records/db.records.service';
import { SchemasService } from '@d19n/schema-manager/dist/schemas/schemas.service';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FeatureModelsService {

    constructor(
        private dbRecordsAssociationsService: DbRecordsAssociationsService,
        private dbService: DbService,
        private schemasService: SchemasService,
        private dbRecordsService: DbRecordsService,
        private amqpConnection: AmqpConnection,
    ) {
        this.schemasService = schemasService;
        this.dbService = dbService;
        this.dbRecordsService = dbRecordsService;
        this.dbRecordsAssociationsService = dbRecordsAssociationsService;
        this.amqpConnection = amqpConnection;
    }


}
