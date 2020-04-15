import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { SendgridEmailEntity } from '@d19n/models/dist/notifications/sendgrid/email/sendgrid.email.entity';
import { RPC_CREATE_ORDER_ITEMS, SUB_SEND_DYNAMIC_EMAIL } from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import { DbRecordAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/association/dto/db.record.association.create.update.dto';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { IDbRecordCreateUpdateRes } from '@d19n/models/dist/schema-manager/db/record/interfaces/interfaces';
import { getProperty, getPropertyFromRelation } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { DbService } from '@d19n/schema-manager/dist/db/db.service';
import { DbRecordsAssociationsService } from '@d19n/schema-manager/dist/db/records/associations/db.records.associations.service';
import { DbRecordsService } from '@d19n/schema-manager/dist/db/records/db.records.service';
import { PipelineEntitysService } from '@d19n/schema-manager/dist/pipelines/pipelines.service';
import { SchemasService } from '@d19n/schema-manager/dist/schemas/schemas.service';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { capitalCase } from 'change-case';
import { AccountsService } from '../accounts/accounts.service';
import { LeadProductCalculations } from '../helpers/LeadProductCalculations';
import moment = require('moment');

const { NOTIFICATION_MODULE, ORDER_MODULE } = SchemaModuleTypeEnums;
const { ADDRESS, PRODUCT, CONTACT, ORDER } = SchemaModuleEntityTypeEnums;

@Injectable()
export class LeadsService {

    constructor(
        @Inject(forwardRef(() => DbRecordsAssociationsService)) private readonly dbRecordsAssociationsService: DbRecordsAssociationsService,
        @Inject(forwardRef(() => DbService)) private readonly dbService: DbService,
        private readonly schemasService: SchemasService,
        private readonly dbRecordsService: DbRecordsService,
        private readonly pipelinesService: PipelineEntitysService,
        private readonly accountsService: AccountsService,
        private readonly amqpConnection: AmqpConnection,
    ) {

        this.schemasService = schemasService;
        this.dbService = dbService;
        this.dbRecordsService = dbRecordsService;
        this.dbRecordsAssociationsService = dbRecordsAssociationsService;
        this.pipelinesService = pipelinesService;
        this.accountsService = accountsService;
        this.amqpConnection = amqpConnection;

    }

    /**
     *
     * @param principal
     * @param leadId
     * @param headers
     */
    public async handleStageChange(principal: OrganizationUserEntity, leadId: string) {
        try {

            const lead = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                leadId,
                [ ADDRESS, PRODUCT, CONTACT ],
            );

            const leadAddress = lead[ADDRESS];
            const leadContact = lead[CONTACT];
            const leadProduct = lead[PRODUCT];

            const leadSource = getProperty(lead, 'Source');

            const addrSalesStatus = getPropertyFromRelation(lead, ADDRESS, 'SalesStatus');
            const addrFullAddress = getPropertyFromRelation(lead, ADDRESS, 'FullAddress');
            const addrUdprn = getPropertyFromRelation(lead, ADDRESS, 'UDPRN');
            const addrUmprn = getPropertyFromRelation(lead, ADDRESS, 'UMPRN');

            const contactFirstName = getPropertyFromRelation(lead, CONTACT, 'FirstName');
            const contactEmailAddress = getPropertyFromRelation(lead, CONTACT, 'EmailAddress');

            if(lead.stage.name === 'Contacted') {

                if(getProperty(lead, 'Source') === 'WEBSITE' && !!leadAddress && [
                    'REGISTER_INTEREST',
                    'NO_STATUS',
                ].includes(addrSalesStatus) && !!leadContact.dbRecords) {
                    // Send pre order confirmation email
                    const newEmail = new SendgridEmailEntity();
                    newEmail.to = contactEmailAddress;
                    newEmail.from = principal.organization.billingReplyToEmail;
                    newEmail.templateLabel = 'SENDGRID_REGISTER_INTEREST_CONFIRMATION';
                    newEmail.dynamicTemplateData = {
                        sales_status: capitalCase(addrSalesStatus),
                        subject: 'Thank you for your interest',
                        contactFirstName: contactFirstName,
                        organizationName: principal.organization.name,
                    };

                    await this.amqpConnection.publish(
                        NOTIFICATION_MODULE,
                        `${NOTIFICATION_MODULE}.${SUB_SEND_DYNAMIC_EMAIL}`,
                        {
                            principal,
                            body: newEmail,
                        },
                    )
                }
            }

            if(lead.stage.name === 'Qualified') {
                if(leadSource === 'WEBSITE' && !!leadAddress && addrSalesStatus === 'PRE_ORDER' && !!leadContact) {
                    const newEmail = new SendgridEmailEntity();
                    newEmail.to = contactEmailAddress;
                    newEmail.from = principal.organization.billingReplyToEmail;
                    newEmail.templateLabel = 'SENDGRID_PREORDER_CONFIRMATION';
                    newEmail.dynamicTemplateData = {
                        contactFirstName: contactFirstName,
                        organizationName: principal.organization.name,
                    };

                    await this.amqpConnection.publish(
                        NOTIFICATION_MODULE,
                        `${NOTIFICATION_MODULE}.${SUB_SEND_DYNAMIC_EMAIL}`,
                        {
                            principal,
                            body: newEmail,
                        },
                    )
                }
            }

            if(lead.stage.name === 'Won' && !!leadAddress && !!leadContact && !!leadProduct) {
                const account = await this.accountsService.createAccountFromLeadByPrincipal(
                    principal,
                    lead.id,
                );

                const orderCreate = new DbRecordCreateUpdateDto();
                orderCreate.entity = `${ORDER_MODULE}:${ORDER}`;
                orderCreate.title = addrFullAddress;
                orderCreate.properties = {
                    IssuedDate: moment().format('YYYY-MM-DD'),
                    ActivationStatus: 'DRAFT',
                    BillingTerms: 'NET_3',
                    CurrencyCode: 'GBP',
                    UDPRN: addrUdprn,
                    UMPRN: addrUmprn,
                };
                orderCreate.associations = [
                    {
                        recordId: leadAddress.dbRecords[0].id,
                    },
                    {
                        recordId: leadContact.dbRecords[0].id,
                    },
                    {
                        recordId: account.id,
                    },
                ];

                const order = await this.dbService.updateOrCreateDbRecordsByPrincipal(
                    principal,
                    [ orderCreate ],
                );


                if(leadProduct.dbRecords) {

                    // Create order items for the order
                    const orderProducts: DbRecordAssociationCreateUpdateDto[] = [];

                    for(const product of leadProduct.dbRecords) {
                        const association = new DbRecordAssociationCreateUpdateDto();
                        association.recordId = product.id;
                        orderProducts.push(association);
                    }

                    if(orderProducts && orderProducts.length > 0) {
                        const res = await this.amqpConnection.request<any>({
                            exchange: ORDER_MODULE,
                            routingKey: `${ORDER_MODULE}.${RPC_CREATE_ORDER_ITEMS}`,
                            payload: {
                                principal,
                                orderId: order[0].id,
                                body: orderProducts,
                            },
                            timeout: 10000,
                        });
                        if(!res.successful) {
                            throw new ExceptionType(res.statusCode, res.message, res.validation);
                        }
                    }
                }
                return { accountId: account.id, orderId: order[0].id };
            }

            return { leadId: lead.id };
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }

    /**
     *  This will adjust discount periods / free periods and taxes for an order.
     * @param principal
     * @param orderId
     * @param headers
     */
    public async computeLeadProductTotals(
        principal: OrganizationUserEntity,
        leadId: string,
    ): Promise<IDbRecordCreateUpdateRes> {
        try {
            const lead = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                leadId,
                [ PRODUCT ],
            );

            const leadProducts = lead[PRODUCT].dbRecords;

            let update;
            if(!leadProducts) {
                update = {
                    schemaId: lead.schemaId,
                    properties: {
                        TotalValue: '0.00',
                    },
                };
            } else {
                update = {
                    schemaId: lead.schemaId,
                    properties: {
                        TotalValue: LeadProductCalculations.computeTotalValue(leadProducts),
                    },
                }
            }

            return await this.dbService.updateDbRecordsByPrincipalAndId(principal, leadId, update);
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }

}
