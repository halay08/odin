import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { SendgridEmailEntity } from '@d19n/models/dist/notifications/sendgrid/email/sendgrid.email.entity';
import * as sgMail from '@sendgrid/mail';
import * as dotenv from 'dotenv';
import { TemplatesEmailService } from '../templates/email/templates.email.service';

dotenv.config();

export class SendgridClient {
    private sendGridToken: string;
    private templatesEmailService: TemplatesEmailService;

    constructor(sendGridToken: string) {

        sgMail.setApiKey(sendGridToken);
        this.sendGridToken = sendGridToken;

    }

    // using Twilio SendGrid's v3 Node.js Library
    // https://github.com/sendgrid/sendgrid-nodejs
    // Template
    // http://styleguide.sendgrid.com/tables-billing.html

    /**
     *
     * @param principal
     * @param sendgridEmailEntity
     */
    public async passwordReset(
        principal: OrganizationUserEntity,
        sendgridEmailEntity: SendgridEmailEntity,
    ): Promise<any> {
        try {
            const msg = {
                to: sendgridEmailEntity.to,
                from: sendgridEmailEntity.from,
                subject: sendgridEmailEntity.subject,
                text: `${sendgridEmailEntity.body}`,
                attachments: sendgridEmailEntity.attachments,
                html: `<strong>${sendgridEmailEntity.body}</strong><br><a href='${sendgridEmailEntity['resetLink']}'>${sendgridEmailEntity['resetLink']}</a>`,
                custom_args: {
                    userId: principal.id,
                    organizationId: principal.organization.id,
                },
            };

            const res = await sgMail.send(msg);
            return res;
        } catch (e) {
            throw new ExceptionType(500, e.message);
        }
    }

    /**
     *
     * @param principal
     * @param sendgridEmailEntity
     */
    // @ts-ignore
    public async userRegistered(
        principal: OrganizationUserEntity,
        sendgridEmailEntity: SendgridEmailEntity,
    ): Promise<any> {
        try {
            const msg = {
                to: sendgridEmailEntity.to,
                from: sendgridEmailEntity.from,
                subject: sendgridEmailEntity.subject,
                text: `${sendgridEmailEntity.body}`,
                attachments: sendgridEmailEntity.attachments,
                html: `<strong>${sendgridEmailEntity.body}</strong><br><a href='${sendgridEmailEntity['activateLink']}'>${sendgridEmailEntity['activateLink']}</a>`,
                custom_args: {
                    userId: principal.id,
                    organizationId: principal.organization.id,
                },
            };

            const res = await sgMail.send(msg);

            return res;
        } catch (e) {

            throw new ExceptionType(500, e.message);

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
        sendgridEmailEntity: SendgridEmailEntity,
    ): Promise<any> {
        try {
            const msg = {
                to: sendgridEmailEntity.to,
                from: sendgridEmailEntity.from,
                subject: sendgridEmailEntity.subject,
                text: `${sendgridEmailEntity.body}`,
                attachments: sendgridEmailEntity.attachments,
                html: `<p>${sendgridEmailEntity.body}</p> \
                       <p><strong>Type: </strong> ${sendgridEmailEntity.dynamicTemplateData['entityName']}</p>
                       <p><strong>Number: </strong> ${sendgridEmailEntity.dynamicTemplateData['recordNumber']}</p>
                       <p><strong>Description: </strong> ${sendgridEmailEntity.dynamicTemplateData['description']}</p>`,
                // <p><strong>Desktop Link: </strong> <a
                // href='${sendgridEmailEntity['links']['record']}'>${sendgridEmailEntity.dynamicTemplateData['title']}</a></p>
                // <p><strong>Mobile Link: </strong> <a
                // href='${sendgridEmailEntity['links']['record']}'>${sendgridEmailEntity.dynamicTemplateData['title']}</a></p>`,
                custom_args: {
                    userId: principal.id,
                    organizationId: principal.organization.id,
                },
            };

            const res = await sgMail.send(msg);

            return res;
        } catch (e) {

            throw new ExceptionType(500, e.message);

        }

    }

    /**
     *
     * @param principal
     * @param sendgridEmailEntity
     */
    // @ts-ignore
    public async dynamicTemplate(
        principal: OrganizationUserEntity,
        sendgridEmailEntity: SendgridEmailEntity,
    ): Promise<any> {
        try {

            const msg = {
                to: sendgridEmailEntity.to,
                from: {
                    name: principal.organization.name,
                    email: sendgridEmailEntity.from,
                },
                subject: sendgridEmailEntity.subject,
                text: 'confirmation',
                html: '<p>confirmation</p>',
                template_id: sendgridEmailEntity.templateId,
                dynamic_template_data: sendgridEmailEntity.dynamicTemplateData,
                attachments: sendgridEmailEntity.attachments,
                custom_args: {
                    recordId: sendgridEmailEntity.dynamicTemplateData.recordId,
                    userId: principal.id,
                    organizationId: principal.organization.id,
                    dynamicTemplateData: { templateId: sendgridEmailEntity.templateId },
                },
            };

            console.log('msg', msg);

            const res = await sgMail.send(msg);
            console.log('res', res);
            return res;
        } catch (e) {
            console.error(e.response.body.errors);
            throw new ExceptionType(e.code, e.message);
        }
    }
}
