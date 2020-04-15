import { RabbitMessageQueueModule } from '@d19n/client/dist/rabbitmq/rabbitmq.module';
import { DbModule } from '@d19n/schema-manager/dist/db/db.module';
import { PipelineEntitysStagesModule } from '@d19n/schema-manager/dist/pipelines/stages/pipelines.stages.module';
import { Module } from '@nestjs/common';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';

@Module({
    imports: [
        DbModule,
        PipelineEntitysStagesModule,
        RabbitMessageQueueModule.forRoot(),
    ],
    controllers: [ CheckoutController ],
    providers: [ CheckoutService ],
    exports: [ CheckoutService ],
})
export class CheckoutModule {
}
