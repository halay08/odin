import { RabbitMessageQueueModule } from '@d19n/client/dist/rabbitmq/rabbitmq.module';
import { DbModule } from '@d19n/schema-manager/dist/db/db.module';
import { SchemasModule } from '@d19n/schema-manager/dist/schemas/schemas.module';
import { Module } from '@nestjs/common';
import { GocardlessModule } from '../gocardless/gocardless.module';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
    imports: [
        DbModule,
        SchemasModule,
        GocardlessModule,
        RabbitMessageQueueModule.forRoot(),
    ],
    controllers: [
        TransactionsController,
    ],
    providers: [
        TransactionsService,
    ],
    exports: [
        TransactionsService,
    ],
})

export class TransactionsModule {
}
