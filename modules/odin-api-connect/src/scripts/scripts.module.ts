import { RabbitMessageQueueModule } from '@d19n/client/dist/rabbitmq/rabbitmq.module';
import { Module } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { ScriptsController } from './scripts.controller';
import { IndexDbService } from './search-indexing/index.db.service';

dotenv.config();

@Module({
    imports: [
        RabbitMessageQueueModule.forRoot(),
    ],
    controllers: [
        ScriptsController,
    ],
    providers: [
        IndexDbService,
    ],
    exports: [
        IndexDbService,
    ],

})
export class ScriptsModule {

}
