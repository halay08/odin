import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { Options } from 'amqplib';

@Injectable()
export class RabbitmqMessageClient {

    public constructor(public readonly ampqConnection: AmqpConnection) {

    }

    /**
     *
     * @param exchange
     * @param routingKey
     * @param payload
     * @param options
     */
    public publish<T>(exchange: string, routingKey: string, payload: T, options?: Options.Publish): void {

        this.ampqConnection.publish(exchange, routingKey, payload, options);

    }

    /**
     *
     * @param exchange
     * @param routingKey
     * @param payload
     * @param timeout
     */
    public rpc<S, T>(exchange: string, routingKey: string, payload: S, timeout: number = 10000): Promise<T> {

        return this.ampqConnection.request({

            exchange,
            routingKey,
            payload,
            timeout,

        });

    }

}
