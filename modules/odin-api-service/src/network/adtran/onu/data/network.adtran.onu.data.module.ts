import { RabbitMessageQueueModule } from '@d19n/client/dist/rabbitmq/rabbitmq.module';
import { DbModule } from '@d19n/schema-manager/dist/db/db.module';
import { SchemasModule } from '@d19n/schema-manager/dist/schemas/schemas.module';
import { Module } from '@nestjs/common';
import { NetworkAdtranOltModule } from '../../olt/network.adtran.olt.module';
import { NetworkAdtranOnuDataController } from './network.adtran.onu.data.controller';
import { NetworkAdtranOnuDataService } from './network.adtran.onu.data.service';

@Module({
    imports: [
        DbModule,
        SchemasModule,
        RabbitMessageQueueModule.forRoot(),
        NetworkAdtranOltModule,
    ],
    controllers: [ NetworkAdtranOnuDataController ],
    providers: [ NetworkAdtranOnuDataService ],
    exports: [ NetworkAdtranOnuDataService ],
})
export class NetworkAdtranOnuDataModule {
}
