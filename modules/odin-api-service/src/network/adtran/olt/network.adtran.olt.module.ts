import { RabbitMessageQueueModule } from '@d19n/client/dist/rabbitmq/rabbitmq.module';
import { DbModule } from '@d19n/schema-manager/dist/db/db.module';
import { SchemasModule } from '@d19n/schema-manager/dist/schemas/schemas.module';
import { Module } from '@nestjs/common';
import { NetworkAdtranOltController } from './network.adtran.olt.controller';
import { NetworkAdtranOltService } from './network.adtran.olt.service';

@Module({
    imports: [
        DbModule,
        SchemasModule,
        RabbitMessageQueueModule.forRoot(),
    ],
    controllers: [ NetworkAdtranOltController ],
    providers: [ NetworkAdtranOltService ],
    exports: [ NetworkAdtranOltService ],
})
export class NetworkAdtranOltModule {
}
