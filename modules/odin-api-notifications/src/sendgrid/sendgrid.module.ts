import { RabbitMessageQueueModule } from '@d19n/client/dist/rabbitmq/rabbitmq.module';
import { DbModule } from '@d19n/schema-manager/dist/db/db.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { TemplatesEmailModule } from '../templates/email/templates.email.module';
import { SendgridController } from './sendgrid.controller';
import { SendgridRabbitmqHandler } from './sendgrid.rabbitmq.handler';
import { SendgridRepository } from './sendgrid.repository';
import { SendgridEmailServiceRpc } from './sendgrid.rpc';
import { SendgridService } from './sendgrid.service';


dotenv.config();

@Module({
    imports: [
        DbModule,
        TemplatesEmailModule,
        TypeOrmModule.forFeature([ SendgridRepository ]),
        RabbitMessageQueueModule.forRoot(),
    ],
    controllers: [ SendgridController ],
    providers: [
        SendgridService,
        SendgridRabbitmqHandler,
        SendgridEmailServiceRpc,
    ],
})
export class SendgridModule {
}
