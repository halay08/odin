import { ServiceClient } from '@d19n/client/dist/client/ServiceClient';
import { APIClient } from '@d19n/client/dist/common/APIClient';
import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { RPC_CREATE_DB_RECORDS, RPC_CREATE_ORDER_ITEMS } from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import { DbRecordEntity } from '@d19n/models/dist/schema-manager/db/record/db.record.entity';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { IDbRecordCreateUpdateRes } from '@d19n/models/dist/schema-manager/db/record/interfaces/interfaces';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getPropertyFromRelation } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { DbService } from '@d19n/schema-manager/dist/db/db.service';
import { DbRecordsAssociationsService } from '@d19n/schema-manager/dist/db/records/associations/db.records.associations.service';
import { DbRecordsService } from '@d19n/schema-manager/dist/db/records/db.records.service';
import { PipelineEntitysStagesService } from '@d19n/schema-manager/dist/pipelines/stages/pipelines.stages.service';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { AccountsService } from '../accounts/accounts.service';
import { LeadsService } from '../leads/leads.service';
import { PremisesService } from '../premise/premises.service';
import { CheckoutDto } from './type/checkout.dto';
import moment = require('moment');


const { ORDER_MODULE, CRM_MODULE } = SchemaModuleTypeEnums;
const { ADDRESS, CONTACT } = SchemaModuleEntityTypeEnums;

@Injectable()
export class CheckoutService {

    private dbRecordsService: DbRecordsService;
    private dbRecordsAssociationsService: DbRecordsAssociationsService;
    private dbService: DbService;
    private pipelineEntitysStagesService: PipelineEntitysStagesService;

    private accountsService: AccountsService;
    private leadsService: LeadsService;
    private premisesService: PremisesService;
    private amqpConnection: AmqpConnection;
    private readonly odinDb: Connection;

    constructor(
        @InjectConnection('odinDbConnection') odinDb: Connection,
        dbRecordsAssociationsService: DbRecordsAssociationsService,
        dbService: DbService,
        dbRecordsService: DbRecordsService,
        pipelineEntitysStagesService: PipelineEntitysStagesService,
        accountsService: AccountsService,
        leadsService: LeadsService,
        premisesService: PremisesService,
        amqpConnection: AmqpConnection,
    ) {
        this.dbService = dbService;
        this.dbRecordsService = dbRecordsService;
        this.dbRecordsAssociationsService = dbRecordsAssociationsService;
        this.pipelineEntitysStagesService = pipelineEntitysStagesService;
        this.accountsService = accountsService;
        this.leadsService = leadsService;
        this.premisesService = premisesService;
        this.amqpConnection = amqpConnection;
        this.odinDb = odinDb;
    }

    /**
     *
     * @param principal
     * @param body
     * @param headers
     */
    public async handleWebsiteCheckout(
        principal: OrganizationUserEntity,
        body: CheckoutDto,
        headers: { [key: string]: any },
    ): Promise<{ orderId: string }> {
        try {

            // store order request as backup
            this.odinDb.manager.createQueryBuilder()
                .insert()
                .into('checkout_backup_requests', [
                    'body',
                ])
                .values([ { body: body } ])
                .execute();

            // get the lead
            const lead = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                body.leadId,
                [ ADDRESS, CONTACT ],
            );


            // Verify bank details
            await APIClient.call<DbRecordEntity>({
                facility: 'http',
                baseUrl: Utilities.getBaseUrl(SERVICE_NAME.BILLING_MODULE),
                service: `v1.0/gocardless/bank-lookup`,
                method: 'post',
                headers: { Authorization: headers.authorization },
                body: {
                    'accountNumber': body.accountNumber,
                    'branchCode': body.branchCode,
                    'countryCode': 'GB',
                },
                debug: false,
            });

            // Check address sales status
            //  - Find 10% discount
            //  - If sales status is Pre Order
            const addrSalesStatus = getPropertyFromRelation(lead, ADDRESS, 'SalesStatus');
            let discountId;

            if([ null, 'null', undefined, 'undefined', '' ].includes(body.discountCode) === false) {
                try {
                    const discountRes = await APIClient.call<DbRecordEntity>({
                        facility: 'http',
                        baseUrl: Utilities.getBaseUrl(SERVICE_NAME.PRODUCT_MODULE),
                        service: `v1.0/discounts/byCode/${body.discountCode}`,
                        method: 'get',
                        headers: { Authorization: headers.authorization },
                        debug: false,
                    });

                    if(discountRes) {
                        discountId = discountRes.id;
                    }
                } catch (e) {
                    console.error('discount redeem issue by code', e);
                }
            } else if(addrSalesStatus && addrSalesStatus === 'PRE_ORDER') {

                try {
                    const discountRes = await APIClient.call<DbRecordEntity>({
                        facility: 'http',
                        baseUrl: Utilities.getBaseUrl(SERVICE_NAME.PRODUCT_MODULE),
                        service: `v1.0/discounts/byCode/10OFF12`,
                        method: 'get',
                        headers: { Authorization: headers.authorization },
                        debug: false,
                    });

                    if(discountRes) {
                        discountId = discountRes.id;
                    }

                } catch (e) {
                    console.error('discount redeem issue by code', e);
                }
            }

            await this.validateCheckout(lead, body);

            const leadAddress = lead[ADDRESS].dbRecords[0];
            const leadContact = lead[CONTACT].dbRecords[0];

            // Create customer payment method
            await APIClient.call<DbRecordEntity>({
                facility: 'http',
                baseUrl: Utilities.getBaseUrl(SERVICE_NAME.BILLING_MODULE),
                service: `v1.0/contact/${body.contactId}/payment-methods`,
                method: 'post',
                headers: { Authorization: headers.authorization },
                body: {
                    identityName: body.identityName,
                    authorizedDirectDebit: body.authorizedDirectDebit ? body.authorizedDirectDebit : true,
                    bankDetails: {
                        accountNumber: body.accountNumber,
                        branchCode: body.branchCode,
                    },
                },
                debug: true,
            });

            // Create account
            const leadContactFirstName = getPropertyFromRelation(lead, CONTACT, 'FirstName');
            const leadContactLastName = getPropertyFromRelation(lead, CONTACT, 'LastName');
            const leadContactPhone = getPropertyFromRelation(lead, CONTACT, 'Phone');

            const newAccount = new DbRecordCreateUpdateDto();
            newAccount.entity = `${SchemaModuleTypeEnums.CRM_MODULE}:${SchemaModuleEntityTypeEnums.ACCOUNT}`;
            newAccount.title = `${leadContactFirstName} ${leadContactLastName} ${leadContactPhone}`;
            newAccount.properties = {
                Type: lead.properties['Type'],
                GroupBilling: 'NO',
            };
            newAccount.associations = [
                {
                    recordId: leadAddress.id,
                },
                {
                    recordId: leadContact.id,
                },
            ];

            // Create a new account
            const accountRes = await this.amqpConnection.request<any>({
                exchange: CRM_MODULE,
                routingKey: `${CRM_MODULE}.${RPC_CREATE_DB_RECORDS}`,
                payload: {
                    principal,
                    body: [ newAccount ],
                    query: { upsert: true },
                },
                timeout: 30000,
            });

            if(accountRes && !accountRes.successful) {
                throw new ExceptionType(accountRes.statusCode, accountRes.message, accountRes.validation);
            }

            const account = accountRes['data'][0];

            // Create order
            const addrFullAddress = getPropertyFromRelation(lead, ADDRESS, 'FullAddress');
            const addrUdprn = getPropertyFromRelation(lead, ADDRESS, 'UDPRN');
            const addrUmprn = getPropertyFromRelation(lead, ADDRESS, 'UMPRN');

            const orderCreate = new DbRecordCreateUpdateDto();
            orderCreate.entity = `${SchemaModuleTypeEnums.ORDER_MODULE}:${SchemaModuleEntityTypeEnums.ORDER}`;
            orderCreate.title = addrFullAddress;
            orderCreate.properties = {
                IssuedDate: moment().format('YYYY-MM-DD'),
                RequestedDeliveryDate: body.appointment ? body.appointment['Date'] : undefined,
                ActivationStatus: 'DRAFT',
                BillingTerms: 'NET_3',
                CurrencyCode: 'GBP',
                UDPRN: addrUdprn,
                UMPRN: addrUmprn,
                ...body.orderProperties,
            };
            orderCreate.associations = [
                {
                    recordId: leadAddress.id,
                },
                {
                    recordId: leadContact.id,
                },
                {
                    recordId: account.id,
                },
                {
                    recordId: discountId, // undefined if no discount
                },
            ];

            // Create a new order
            const orderRes = await this.amqpConnection.request<any>({
                exchange: ORDER_MODULE,
                routingKey: `${ORDER_MODULE}.${RPC_CREATE_DB_RECORDS}`,
                payload: {
                    principal,
                    body: [ orderCreate ],
                    query: { upsert: false },
                },
                timeout: 30000,
            });

            if(orderRes && !orderRes.successful) {
                throw new ExceptionType(orderRes.statusCode, orderRes.message, orderRes.validation);
            }

            const order = orderRes['data'][0];

            // Add products to the order
            const orderItemsRes = await this.amqpConnection.request<any>({
                exchange: ORDER_MODULE,
                routingKey: `${ORDER_MODULE}.${RPC_CREATE_ORDER_ITEMS}`,
                payload: {
                    principal,
                    orderId: order.id,
                    body: body.products,
                },
                timeout: 30000,
            });

            if(orderItemsRes && !orderItemsRes.successful) {
                throw new ExceptionType(orderItemsRes.statusCode, orderItemsRes.message, orderItemsRes.validation);
            }

            // handle customer phone porting
            // TODO: Extract logic to be asynchronously handled with events
            if(body.customerPhonePorting) {

                console.log('orderItemsRes', orderItemsRes);

                const orderItems = await this.dbService.getManyDbRecordsByOrganizationAndIds(
                    principal.organization,
                    { recordIds: orderItemsRes['data'].map(elem => elem.id) },
                )

                for(const item of orderItems) {

                    const isVoiceItem = item.columns.find(elem => elem.column.name === 'ProductCategory' && elem.value === 'VOICE');

                    console.log('isVoiceItem', isVoiceItem);

                    if(isVoiceItem) {

                        const newPhonePorting = new DbRecordCreateUpdateDto();
                        newPhonePorting.entity = 'ServiceModule:CustomerPhonePorting';
                        newPhonePorting.properties = {
                            AreaCode: body.customerPhonePorting.AreaCode,
                            CountryCode: body.customerPhonePorting.CountryCode,
                            SubscriberNumber: body.customerPhonePorting.SubscriberNumber,
                            AuthorizedLOA: body.customerPhonePorting.AuthorizedLOA,
                        };
                        newPhonePorting.associations = [
                            {
                                recordId: item.id,
                            },
                        ];

                        this.dbService.updateOrCreateDbRecordsByPrincipal(
                            principal,
                            [ newPhonePorting ],
                            { upsert: false },
                        );
                    }
                }
            }

            // Update the contacts properties
            if(!!body.contactProperties && Object.keys(body.contactProperties).length > 0) {
                const contactProperties = new DbRecordCreateUpdateDto();
                contactProperties.entity = `${SchemaModuleTypeEnums.CRM_MODULE}:${SchemaModuleEntityTypeEnums.CONTACT}`;
                contactProperties.properties = body.contactProperties;
                this.dbService.updateDbRecordsByPrincipalAndId(principal, body.contactId, contactProperties);
            }

            // Change the order stage to the stage set by the orderStageKey
            if(body.orderStageKey) {
                const stage = await this.pipelineEntitysStagesService.getPipelineAndStagesByStageKey(
                    principal.organization,
                    body.orderStageKey,
                );
                const updateDto = new DbRecordCreateUpdateDto();
                updateDto.entity = `${SchemaModuleTypeEnums.ORDER_MODULE}:${SchemaModuleEntityTypeEnums.ORDER}`;
                updateDto.stageId = stage.id;

                ServiceClient.callAxios<IDbRecordCreateUpdateRes[]>({
                    facility: 'http',
                    baseUrl: Utilities.getBaseUrl(SERVICE_NAME.ORDER_MODULE),
                    service: `v1.0/db/${SchemaModuleEntityTypeEnums.ORDER}/${order.id}`,
                    method: 'put',
                    headers: { Authorization: headers.authorization },
                    body: updateDto,
                    debug: true,
                });
            }

            this.premisesService.removeRelatedLeadFromPremise(principal, lead.id);
            this.dbService.deleteByPrincipalAndId(principal, lead.id);

            return { orderId: order.id };
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }

    /**
     *
     * @param lead
     * @param body
     */
    private async validateCheckout(lead: DbRecordEntityTransform, body: CheckoutDto) {
        const { ADDRESS, CONTACT } = SchemaModuleEntityTypeEnums;

        if(!body.accountNumber && !body.branchCode && !body.contactId && !body.identityName) {
            throw new ExceptionType(400, 'missing bank details, contact, payment method');
        }

        if(!body.products) {
            throw new ExceptionType(400, 'please select products');
        }

        if(!lead[ADDRESS].dbRecords) {
            throw new ExceptionType(400, 'please add an address to the lead');
        }

        if(!lead[CONTACT].dbRecords) {
            throw new ExceptionType(400, 'please add a contact to the lead');
        }

    }

}
