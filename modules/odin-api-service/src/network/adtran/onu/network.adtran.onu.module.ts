import { RabbitMessageQueueModule } from '@d19n/client/dist/rabbitmq/rabbitmq.module';
import { DbModule } from '@d19n/schema-manager/dist/db/db.module';
import { SchemasModule } from '@d19n/schema-manager/dist/schemas/schemas.module';
import { Module } from '@nestjs/common';
import { NetworkAdtranOltModule } from '../olt/network.adtran.olt.module';
import { NetworkAdtranOnuController } from './network.adtran.onu.controller';
import { NetworkAdtranOnuRabbitmqService } from './network.adtran.onu.rabbitmq.service';
import { NetworkAdtranOnuService } from './network.adtran.onu.service';

@Module({
    imports: [
        DbModule,
        NetworkAdtranOltModule,
        SchemasModule,
        RabbitMessageQueueModule.forRoot(),
    ],
    controllers: [ NetworkAdtranOnuController ],
    providers: [ NetworkAdtranOnuService, NetworkAdtranOnuRabbitmqService ],
    exports: [ NetworkAdtranOnuService ],
})
export class NetworkAdtranOnuModule {
}
