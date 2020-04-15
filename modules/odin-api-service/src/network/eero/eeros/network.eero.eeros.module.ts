import { RabbitMessageQueueModule } from '@d19n/client/dist/rabbitmq/rabbitmq.module';
import { DbModule } from '@d19n/schema-manager/dist/db/db.module';
import { SchemasModule } from '@d19n/schema-manager/dist/schemas/schemas.module';
import { Module } from '@nestjs/common';
import { NetworkEeroEerosController } from './network.eero.eeros.controller';
import { NetworkEeroEerosRabbitmqHandler } from './network.eero.eeros.rabbitmq.handler';
import { NetworkEeroEerosService } from './network.eero.eeros.service';

@Module({
    imports: [
        DbModule,
        SchemasModule,
        RabbitMessageQueueModule.forRoot(),
    ],
    controllers: [ NetworkEeroEerosController ],
    providers: [ NetworkEeroEerosService, NetworkEeroEerosRabbitmqHandler ],
    exports: [ NetworkEeroEerosService ],
})
export class NetworkEeroEerosModule {
}
