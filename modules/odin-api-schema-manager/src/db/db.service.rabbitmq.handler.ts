import { SUB_CREATE_DB_RECORDS } from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { DbService } from './db.service';


@Injectable()
export class DbServiceRabbitmqHandler {

  private readonly dbService: DbService;
  private readonly amqpConnection: AmqpConnection;

  constructor(
    dbService: DbService,
    amqpConnection: AmqpConnection,
  ) {
    this.dbService = dbService;
    this.amqpConnection = amqpConnection;
  }

  /**
   *
   * @param msg
   * @private
   */
  @RabbitSubscribe({
    exchange: process.env.MODULE_NAME,
    routingKey: `${process.env.MODULE_NAME}.${SUB_CREATE_DB_RECORDS}`,
    queue: `${process.env.MODULE_NAME}.${SUB_CREATE_DB_RECORDS}`,
  })
  private async handleCreatedCreateDbRecords(msg: any) {
    try {

      await this.dbService.updateOrCreateDbRecordsByPrincipal(
        msg.principal,
        msg.body,
        msg.query,
      );

    } catch (e) {
      console.error(e);
    }
  }

  private static handleError(e) {
    console.error('queries event handler error', e);
  }

}
