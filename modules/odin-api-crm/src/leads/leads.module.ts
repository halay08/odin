import { RabbitMessageQueueModule } from '@d19n/client/dist/rabbitmq/rabbitmq.module';
import { DbModule } from '@d19n/schema-manager/dist/db/db.module';
import { PipelineEntitysModule } from '@d19n/schema-manager/dist/pipelines/pipelines.module';
import { SchemasModule } from '@d19n/schema-manager/dist/schemas/schemas.module';
import { Module } from '@nestjs/common';
import { AccountsModule } from '../accounts/accounts.module';
import { PremisesModule } from '../premise/premises.module';
import { LeadsRabbitmqHandler } from './leads.rabbitmq.handler';
import { LeadsService } from './leads.service';

@Module({
    imports: [
        DbModule,
        SchemasModule,
        PipelineEntitysModule,
        AccountsModule,
        PremisesModule,
        RabbitMessageQueueModule.forRoot(),
    ],
    providers: [ LeadsService, LeadsRabbitmqHandler ],
    exports: [ LeadsService ],
})
export class LeadsModule {
}
