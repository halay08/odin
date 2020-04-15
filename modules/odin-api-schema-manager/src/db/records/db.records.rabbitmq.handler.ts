import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { DbRecordsRepository } from './db.records.repository';

interface ISystemSoftDeleteCleanup {
  principal: OrganizationUserEntity,
  recordId: string
}

export class DbRecordsRabbitmqHandler {

  constructor(
    private dbRecordsRepository: DbRecordsRepository,
    private amqpConnection: AmqpConnection,
  ) {

    this.dbRecordsRepository = dbRecordsRepository;
    this.amqpConnection = amqpConnection;

  }

  /**
   * We hard delete records after XX hours
   * @param principal
   * @param dbRecord
   */
  @RabbitSubscribe({
    exchange: 'SchemaModule',
    routingKey: `SchemaModule.DbRecordSoftDeleteCleanup`,
    queue: `SchemaModule.DbRecordSoftDeleteCleanup`,
  })
  public async handleSystemDbRecordSoftDeleteCleanup(msg: ISystemSoftDeleteCleanup) {

    await this.dbRecordsRepository.hardDelete(msg.principal.organization, msg.recordId);
  }
}
