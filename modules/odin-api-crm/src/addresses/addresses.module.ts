import { RabbitMessageQueueModule } from '@d19n/client/dist/rabbitmq/rabbitmq.module';
import { DbModule } from '@d19n/schema-manager/dist/db/db.module';
import { Module } from '@nestjs/common';
import { PremisesModule } from '../premise/premises.module';
import { AddressesRabbitmqHandler } from './addresses.rabbitmq.handler';
import { AddressesService } from './addresses.service';

@Module({
    imports: [

        DbModule,
        PremisesModule,
        RabbitMessageQueueModule.forRoot(),

    ],
    controllers: [],
    providers: [ AddressesService, AddressesRabbitmqHandler ],
    exports: [ AddressesService ],
})
export class AddressesModule {
}
