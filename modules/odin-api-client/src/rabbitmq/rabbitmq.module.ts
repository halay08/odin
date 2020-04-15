import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { DynamicModule, Module } from '@nestjs/common';

@Module({})

export class RabbitMessageQueueModule {
    static forRoot(exchanges = []): DynamicModule {
        return {
            module: RabbitMessageQueueModule,
            imports: [
                RabbitMQModule.forRoot(RabbitMQModule, {
                    exchanges: [
                        {
                            name: process.env.MODULE_NAME,
                            type: 'topic',
                        },
                        ...exchanges,
                    ],
                    uri: process.env.AWS_AMQP_URL ? process.env.AWS_AMQP_URL : `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASS}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`,
                    connectionInitOptions: { wait: false },
                }),
            ],
            exports: [
                RabbitMQModule.forRoot(RabbitMQModule, {
                    exchanges: [
                        {
                            name: process.env.MODULE_NAME,
                            type: 'topic',
                        },
                        ...exchanges,
                    ],
                    uri: process.env.AWS_AMQP_URL ? process.env.AWS_AMQP_URL : `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASS}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`,
                    connectionInitOptions: { wait: false },
                }),
            ],
        }
    }
}
