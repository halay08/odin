import { RabbitMessageQueueModule } from '@d19n/client/dist/rabbitmq/rabbitmq.module';
import { DbModule } from '@d19n/schema-manager/dist/db/db.module';
import { PipelineEntitysModule } from '@d19n/schema-manager/dist/pipelines/pipelines.module';
import { PipelineEntitysStagesModule } from '@d19n/schema-manager/dist/pipelines/stages/pipelines.stages.module';
import { SchemasModule } from '@d19n/schema-manager/dist/schemas/schemas.module';
import { forwardRef, Module } from '@nestjs/common';
import { ServiceAppointmentModule } from '../service-appointment/service.appointment.module';
import { WorkOrderController } from './work.order.controller';
import { WorkOrderRabbitmqHandler } from './work.order.rabbitmq.handler';
import { WorkOrderService } from './work.order.service';

@Module({
    imports: [
        forwardRef(() => DbModule),
        forwardRef(() => SchemasModule),
        forwardRef(() => ServiceAppointmentModule),
        PipelineEntitysModule,
        PipelineEntitysStagesModule,
        RabbitMessageQueueModule.forRoot(),
    ],
    controllers: [ WorkOrderController ],
    providers: [ WorkOrderService, WorkOrderRabbitmqHandler ],
    exports: [ WorkOrderService ],
})
export class WorkOrderModule {
}
