import { RabbitMessageQueueModule } from '@d19n/client/dist/rabbitmq/rabbitmq.module';
import { DbModule } from '@d19n/schema-manager/dist/db/db.module';
import { SchemasModule } from '@d19n/schema-manager/dist/schemas/schemas.module';
import { Module } from '@nestjs/common';
import { NetworkEeroNetworksController } from './network.eero.networks.controller';
import { NetworkEeroNetworksService } from './network.eero.networks.service';

@Module({
    imports: [
        DbModule,
        SchemasModule,
        RabbitMessageQueueModule.forRoot(),
    ],
    controllers: [ NetworkEeroNetworksController ],
    providers: [ NetworkEeroNetworksService ],
    exports: [ NetworkEeroNetworksService ],
})
export class NetworkEeroNetworksModule {
}
