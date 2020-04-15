import { SendgridEmailEntity } from '@d19n/models/dist/notifications/sendgrid/email/sendgrid.email.entity';
import { SUB_DB_RECORD_OWNER_ASSIGNED, SUB_SEND_DYNAMIC_EMAIL } from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import { IDbRecordOwnerAssigned, ISendDynamicEmail } from '@d19n/models/dist/rabbitmq/rabbitmq.interfaces';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { DbService } from '@d19n/schema-manager/dist/db/db.service';
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SendgridRepository } from './sendgrid.repository';
import { SendgridService } from './sendgrid.service';

/**
 *  https://github.com/sendgrid/sendgrid-nodejs/blob/master/docs/use-cases/transactional-templates.md
 */
@Injectable()
export class SendgridRabbitmqHandler {

    private dbService: DbService;
    private readonly amqpConnection: AmqpConnection;
    private readonly sendgridService: SendgridService;
    private sendgridRepository: SendgridRepository;

    constructor(
        @InjectRepository(SendgridRepository) sendgridRepository: SendgridRepository,
        amqpConnection: AmqpConnection,
        sendgridService: SendgridService,
        dbService: DbService,
    ) {
        this.sendgridRepository = sendgridRepository;
        this.amqpConnection = amqpConnection;
        this.sendgridService = sendgridService;
        this.dbService = dbService;
    }

    /**
     *
     * @param principal
     * @param headers
     * @param body
     */
    @RabbitSubscribe({
        exchange: process.env.MODULE_NAME,
        routingKey: `${process.env.MODULE_NAME}.${SUB_SEND_DYNAMIC_EMAIL}`,
        queue: `${process.env.MODULE_NAME}.${SUB_SEND_DYNAMIC_EMAIL}`,
    })
    public async sendDynamicTemplateEmailRpc(msg: ISendDynamicEmail): Promise<any> {
        try {
            await this.sendgridService.sendDynamicTemplateEmail(msg.principal, msg.body);
        } catch (e) {
            console.error(e);
            return;
        }
    }

    /**
     *
     * @param principal
     * @param headers
     * @param body
     */
    @RabbitSubscribe({
        exchange: process.env.MODULE_NAME,
        routingKey: `${process.env.MODULE_NAME}.${SUB_DB_RECORD_OWNER_ASSIGNED}`,
        queue: `${process.env.MODULE_NAME}.${SUB_DB_RECORD_OWNER_ASSIGNED}`,
    })
    public async sendRecordOwnerAssignedEmail(msg: IDbRecordOwnerAssigned): Promise<any> {
        try {

            const record = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                msg.principal.organization,
                msg.id,
                [],
            );

            const newEmail = new SendgridEmailEntity();
            newEmail.to = msg.owner.email;
            newEmail.subject = `${msg.principal.firstname} ${msg.principal.lastname} assigned you ${record.title}`;
            newEmail.links = {
                record: `https://odin.prod.youfibre.com/${msg.schema.moduleName}/${msg.schema.entityName}/${msg.id}`,
            };
            newEmail.body = `Click the link below to view more details.`
            newEmail.dynamicTemplateData = {
                recordNumber: record.recordNumber,
                entityName: msg.schema.entityName,
                title: record.title,
                description: getProperty(record, 'Description'),
            };

            console.log('newEmail', newEmail);

            await this.sendgridService.userAssignedRecord(msg.principal, newEmail);
        } catch (e) {
            console.error(e);
            return;
        }
    }

}
