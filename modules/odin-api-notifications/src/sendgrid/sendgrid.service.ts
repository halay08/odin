import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationAppTypes } from '@d19n/models/dist/identity/organization/app/organization.app.types';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { SendgridEmailEntity } from '@d19n/models/dist/notifications/sendgrid/email/sendgrid.email.entity';
import { RPC_GET_ORG_APP_BY_NAME } from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TemplatesEmailService } from '../templates/email/templates.email.service';
import { SendgridClient } from './sendgrid.client';
import { SendgridRepository } from './sendgrid.repository';

const { IDENTITY_MODULE } = SchemaModuleTypeEnums;

@Injectable()
export class SendgridService {

    // https://github.com/sendgrid/sendgrid-nodejs/blob/master/docs/use-cases/transactional-templates.md

    constructor(
        @InjectRepository(SendgridRepository) private readonly sendgridRepository: SendgridRepository,
        private readonly amqpConnection: AmqpConnection,
        private templatesEmailService: TemplatesEmailService,
    ) {
        this.sendgridRepository = sendgridRepository;
        this.templatesEmailService = templatesEmailService;
        this.amqpConnection = amqpConnection;
    }

    /**
     *
     * @param principal
     * @param headers
     * @param body
     */
    public async sendPasswordResetEmail(principal: OrganizationUserEntity, body: SendgridEmailEntity) {
        try {
            const res = await this.amqpConnection.request<any>({
                exchange: IDENTITY_MODULE,
                routingKey: `${IDENTITY_MODULE}.${RPC_GET_ORG_APP_BY_NAME}`,
                payload: {
                    principal,
                    name: OrganizationAppTypes.SENDGRID,
                },
                timeout: 10000,
            });

            if(res.successful) {
                const sendgridClient = new SendgridClient(res.data.apiKey);
                body.from = principal.organization.billingReplyToEmail;
                return await sendgridClient.passwordReset(principal, body);
            }

            return {};
        } catch (e) {
            throw new ExceptionType(500, e.message, e.validation);
        }
    }

    /**
     *
     * @param principal
     * @param headers
     * @param body
     */
    public async sendNewOrganizationUserEntityRegistrationEmail(
        principal: OrganizationUserEntity,
        body: SendgridEmailEntity,
    ) {
        try {
            const res = await this.amqpConnection.request<any>({
                exchange: IDENTITY_MODULE,
                routingKey: `${IDENTITY_MODULE}.${RPC_GET_ORG_APP_BY_NAME}`,
                payload: {
                    principal,
                    name: OrganizationAppTypes.SENDGRID,
                },
                timeout: 10000,
            });

            if(res.successful) {
                const sendgridClient = new SendgridClient(res.data.apiKey);
                return await sendgridClient.userRegistered(principal, body);
            }

            return {};
        } catch (e) {
            console.error(e);
            throw new ExceptionType(500, e.message, e.validation);
        }
    }

    /**
     *
     * @param principal
     * @param sendgridEmailEntity
     */
    // @ts-ignore
    public async userAssignedRecord(
        principal: OrganizationUserEntity,
        body: SendgridEmailEntity,
    ): Promise<any> {
        try {

            const res = await this.amqpConnection.request<any>({
                exchange: IDENTITY_MODULE,
                routingKey: `${IDENTITY_MODULE}.${RPC_GET_ORG_APP_BY_NAME}`,
                payload: {
                    principal,
                    name: OrganizationAppTypes.SENDGRID,
                },
                timeout: 10000,
            });

            if(res.successful) {

                body.from = principal.organization.billingReplyToEmail;

                const sendgridClient = new SendgridClient(res.data.apiKey);
                return await sendgridClient.userAssignedRecord(principal, body);
            }

            return {};

        } catch (e) {
            console.error(e);
            throw new ExceptionType(500, e.message, e.validation);
        }

    }

    /**
     *
     * @param principal
     * @param headers
     * @param body
     */
    public async sendDynamicTemplateEmail(
        principal: OrganizationUserEntity,
        body: SendgridEmailEntity,
    ): Promise<any> {
        try {

            const res = await this.amqpConnection.request<any>({
                exchange: IDENTITY_MODULE,
                routingKey: `${IDENTITY_MODULE}.${RPC_GET_ORG_APP_BY_NAME}`,
                payload: {
                    principal,
                    name: OrganizationAppTypes.SENDGRID,
                },
                timeout: 10000,
            });

            // If there is no templateId passed in find the template by label
            if(!body.templateId) {
                const template = await this.templatesEmailService.getTemplateByOrganizationAndLabel(
                    principal.organization,
                    body.templateLabel,
                );
                // no templateId in the body, use the template looked up from Odin
                body.templateId = template.templateId;
            }

            if(res.successful) {

                body.from = principal.organization.billingReplyToEmail;

                const sendgridClient = new SendgridClient(res.data.apiKey);
                return await sendgridClient.dynamicTemplate(principal, body);

            }
            return {};
        } catch (e) {
            console.error(e);
            throw new ExceptionType(500, e.message, e.validation);
        }
    }

    /**
     *
     * @param headers
     * @param body
     */
    // @ts-ignore
    public async sendgridWebhook(
        headers: object,
        body: any,
    ): Promise<any> {
        try {
            return await this.sendgridRepository.save(body);
        } catch (e) {
            console.error(e);
        }
    }

    /**
     *
     * @param principal
     * @param headers
     * @param recordId
     */
    public async getSendGridMailActivityByRecordId(principal: OrganizationUserEntity, recordId: string) {
        try {
            console.log('headers:', 'recordId:', recordId);
            return await this.sendgridRepository.find({ recordId })
        } catch (e) {
            console.error(e);
        }
    }


}
