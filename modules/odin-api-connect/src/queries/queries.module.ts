import { RabbitMessageQueueModule } from '@d19n/client/dist/rabbitmq/rabbitmq.module';
import { Module } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { QueriesController } from './queries.controller';
import { QueriesRabbitmqHandler } from './queries.rabbitmq.handler';
import { QueriesService } from './queries.service';

dotenv.config();

@Module({
    imports: [
        RabbitMessageQueueModule.forRoot(),
    ],
    controllers: [
        QueriesController,
    ],
    providers: [
        QueriesService,
        QueriesRabbitmqHandler,
    ],
    exports: [ QueriesService ],

})
export class QueriesModule {

}
