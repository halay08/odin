import { DbModule } from '@d19n/schema-manager/dist/db/db.module';
import { SchemasModule } from '@d19n/schema-manager/dist/schemas/schemas.module';
import { Client } from '@elastic/elasticsearch';
import { Module } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { VisitsModule } from '../visit/visits.module';
import { PremisesController } from './premises.controller';
import { PremisesService } from './premises.service';

dotenv.config();

const elasticSearchProvider = {
    provide: 'ELASTIC_SEARCH_CLIENT',
    useFactory: async () => {
        const client: Client = new Client({ node: process.env.ELASTICSEARCH_HOST });
        console.log('elastic search client connected');
        return client;
    },
};

@Module({
    imports: [
        VisitsModule,
        SchemasModule,
        DbModule,
    ],
    controllers: [ PremisesController ],
    providers: [ PremisesService, elasticSearchProvider ],
    exports: [ PremisesService ],
})
export class PremisesModule {
}
