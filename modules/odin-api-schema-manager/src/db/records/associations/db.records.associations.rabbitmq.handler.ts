import { CREATE_DB_RECORD_ASSOCIATIONS } from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import { ICreatedDbRecordAssociations } from '@d19n/models/dist/rabbitmq/rabbitmq.interfaces';
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { DbRecordsAssociationsService } from './db.records.associations.service';


@Injectable()
export class DbRecordsAssociationsRabbitmqHandler {

  private readonly dbRecordsAssociationsService: DbRecordsAssociationsService;
  private readonly amqpConnection: AmqpConnection;

  constructor(
    dbRecordsAssociationsService: DbRecordsAssociationsService,
    amqpConnection: AmqpConnection,
  ) {
    this.dbRecordsAssociationsService = dbRecordsAssociationsService;
    this.amqpConnection = amqpConnection;
  }

  /**
   *
   * @param msg
   * @private
   */
  @RabbitSubscribe({
    exchange: process.env.MODULE_NAME,
    routingKey: `${process.env.MODULE_NAME}.${CREATE_DB_RECORD_ASSOCIATIONS}`,
    queue: `${process.env.MODULE_NAME}.${CREATE_DB_RECORD_ASSOCIATIONS}`,
  })
  private async handleCreatedAssociations(msg: ICreatedDbRecordAssociations) {

    console.log('handleCreatedAssociations', msg);
    try {
      await this.dbRecordsAssociationsService.createRelatedRecords(
        msg.principal,
        { recordId: msg.id, body: msg.body },
      );
    } catch (e) {
      console.error(e);
    }
  }

}
