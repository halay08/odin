import { APIClient } from '@d19n/client/dist/common/APIClient';
import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { RPC_CREATE_DB_RECORDS, RPC_CREATE_ORDER_ITEMS } from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import { DbRecordEntity } from '@d19n/models/dist/schema-manager/db/record/db.record.entity';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { DbService } from '@d19n/schema-manager/dist/db/db.service';
import { DbRecordsAssociationsService } from '@d19n/schema-manager/dist/db/records/associations/db.records.associations.service';
import { DbRecordsService } from '@d19n/schema-manager/dist/db/records/db.records.service';
import { PipelineEntitysStagesService } from '@d19n/schema-manager/dist/pipelines/stages/pipelines.stages.service';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { CheckoutDto } from './type/checkout.dto';
import moment = require('moment');


const { ORDER_MODULE, CRM_MODULE } = SchemaModuleTypeEnums;

@Injectable()
export class CheckoutService {

    private dbService: DbService;
    private dbRecordsService: DbRecordsService;
    private dbRecordsAssociationsService: DbRecordsAssociationsService;
    private pipelineEntitysStagesService: PipelineEntitysStagesService;

    private amqpConnection: AmqpConnection;

    constructor(
        dbService: DbService,
        dbRecordsAssociationsService: DbRecordsAssociationsService,
        dbRecordsService: DbRecordsService,
        pipelineEntitysStagesService: PipelineEntitysStagesService,
        amqpConnection: AmqpConnection,
    ) {
        this.dbService = dbService;
        this.dbRecordsService = dbRecordsService;
        this.dbRecordsAssociationsService = dbRecordsAssociationsService;
        this.pipelineEntitysStagesService = pipelineEntitysStagesService;
        this.amqpConnection = amqpConnection;
    }

    /**
     *
     * @param principal
     * @param body
     * @param headers
     */
    public async handleOrderCheckout(
        principal: OrganizationUserEntity,
        body: CheckoutDto,
        headers: { [key: string]: any },
    ): Promise<{ orderId: string }> {
        try {

            await this.validateCheckout(body);

            // get the lead
            const address = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                body.addressId,
            );

            // get the contact
            const contact = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                body.contactId,
            );

            // Check address sales status
            //  - Find 10% discount
            //  - If sales status is Pre Order
            const addrSalesStatus = getProperty(address, 'SalesStatus');
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

            // await this.validateCheckout(lead, body);

            // Create account
            const contactFirstName = getProperty(contact, 'FirstName');
            const contactLastName = getProperty(contact, 'LastName');
            const contactPhone = getProperty(contact, 'Phone');

            const newAccount = new DbRecordCreateUpdateDto();
            newAccount.entity = `${SchemaModuleTypeEnums.CRM_MODULE}:${SchemaModuleEntityTypeEnums.ACCOUNT}`;
            newAccount.title = `${contactFirstName} ${contactLastName} ${contactPhone}`;
            newAccount.properties = {
                Type: getProperty(address, 'Classification') === 'C' ? 'BUSINESS' : 'RESIDENTIAL',
                GroupBilling: 'NO',
            };
            newAccount.associations = [
                {
                    recordId: address.id,
                },
                {
                    recordId: contact.id,
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
            const addrFullAddress = getProperty(address, 'FullAddress');
            const addrUdprn = getProperty(address, 'UDPRN');
            const addrUmprn = getProperty(address, 'UMPRN');

            const orderCreate = new DbRecordCreateUpdateDto();
            orderCreate.entity = `${SchemaModuleTypeEnums.ORDER_MODULE}:${SchemaModuleEntityTypeEnums.ORDER}`;
            orderCreate.title = addrFullAddress;
            orderCreate.properties = {
                IssuedDate: moment().format('YYYY-MM-DD'),
                RequestedDeliveryDate: undefined,
                ActivationStatus: 'DRAFT',
                BillingTerms: 'NET_3',
                CurrencyCode: 'GBP',
                UDPRN: addrUdprn,
                UMPRN: addrUmprn,
            };
            orderCreate.associations = [
                {
                    recordId: address.id,
                },
                {
                    recordId: contact.id,
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
    private async validateCheckout(body: CheckoutDto) {

        if(!body.products) {
            throw new ExceptionType(400, 'please select products');
        }

        if(!body.addressId) {
            throw new ExceptionType(400, 'please add an address to the lead');
        }

        if(!body.contactId) {
            throw new ExceptionType(400, 'please add a contact to the lead');
        }

    }

}
