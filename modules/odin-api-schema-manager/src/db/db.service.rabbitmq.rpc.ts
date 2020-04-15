import { CreateDbRecordRabbitmqDto } from '@d19n/models/dist/rabbitmq/dto/create.db.record.rabbitmq.dto';
import { RPC_CREATE_DB_RECORDS } from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import { AmqpConnection, RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { DbService } from './db.service';

dotenv.config();

@Injectable()
export class DbServiceRabbitmqRpc {

  private readonly dbService: DbService;
  private readonly amqpConnection: AmqpConnection;

  constructor(
    dbService: DbService,
    amqpConnection: AmqpConnection,
  ) {
    this.dbService = dbService;
    this.amqpConnection = amqpConnection;
  }


  // RPC methods
  @RabbitRPC({
    exchange: process.env.MODULE_NAME,
    routingKey: `${process.env.MODULE_NAME}.${RPC_CREATE_DB_RECORDS}`,
    queue: `${process.env.MODULE_NAME}.${RPC_CREATE_DB_RECORDS}`,
  })
  public async createDbRecords(msg: CreateDbRecordRabbitmqDto): Promise<any> {
    try {

      const res = await this.dbService.updateOrCreateDbRecordsByPrincipal(
        msg.principal,
        msg.body,
        msg.query,
      );

      if(res) {
        return {
          statusCode: 201,
          successful: true,
          message: 'successfully created records',
          data: res,
        };
      } else {
        return {
          statusCode: 500,
          successful: false,
          message: 'error creating records',
          data: undefined,
        };
      }
    } catch (e) {
      return {
        statusCode: e.statusCode,
        successful: false,
        message: e.message,
        validation: e.validation,
        data: undefined,
      }

    }
  }


  private static handleError(e) {
    console.error('order event handler error', e);
  }
}
