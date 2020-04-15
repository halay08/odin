import { APIClient } from '@d19n/client/dist/common/APIClient';
import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { DbModule } from '@d19n/schema-manager/dist/db/db.module';
import { DbService } from '@d19n/schema-manager/dist/db/db.service';
import { AuthUserHelper } from '@d19n/schema-manager/dist/helpers/AuthUserHelper';
import { TestModuleConfig } from '@d19n/schema-manager/dist/helpers/tests/TestModuleConfig';
import { PipelineEntitysModule } from '@d19n/schema-manager/dist/pipelines/pipelines.module';
import { PipelineEntitysStagesModule } from '@d19n/schema-manager/dist/pipelines/stages/pipelines.stages.module';
import { SchemasModule } from '@d19n/schema-manager/dist/schemas/schemas.module';
import { forwardRef } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { OrdersItemsModule } from './items/orders.items.module';
import { OrdersService } from './orders.service';
import moment = require('moment');

jest.setTimeout(30000);

describe('Orders service', () => {

    let dbService: DbService;
    let orderService: OrdersService;

    let principal: OrganizationUserEntity;

    let order: DbRecordEntityTransform;

    let login: {
        headers: {
            authorization: string
        }
    };

    let app: TestingModule;

    beforeEach(async () => {
        app = await new TestModuleConfig([
            forwardRef(() => OrdersItemsModule),
            DbModule,
            SchemasModule,
            PipelineEntitysModule,
            PipelineEntitysStagesModule,
        ], [
            OrdersService,
        ], []).initialize();

        login = await AuthUserHelper.login();
        principal = await APIClient.call<OrganizationUserEntity>({
            facility: 'http',
            baseUrl: Utilities.getBaseUrl(SERVICE_NAME.IDENTITY_MODULE),
            service: 'v1.0/users/my',
            method: 'get',
            headers: { Authorization: login.headers.authorization },
            debug: false,
        });

        orderService = app.get<OrdersService>(OrdersService);
        dbService = app.get<DbService>(DbService);

    });

    test('should have public methods', (done) => {
        expect(orderService.addDiscountByPrincipal).toBeDefined();
        expect(orderService.removeDiscountByPrincipal).toBeDefined();
        expect(orderService.processOrderForBilling).toBeDefined();
        expect(orderService.computeOrderTotals).toBeDefined();
        expect(orderService.sendOrderEmail).toBeDefined();
        expect(orderService.handleStageChange).toBeDefined();
        expect(orderService.validateStageChange).toBeDefined();
        expect(orderService.handleOrderWorkOrderStageChange).toBeDefined();
        expect(orderService.changeOrderStage).toBeDefined();
        expect(orderService.handleAddressUpdated).toBeDefined();
        expect(orderService.splitOrder).toBeDefined();
        done();
    });


    test('should create a new order', async (done) => {

        const orderCreate = new DbRecordCreateUpdateDto();
        orderCreate.entity = `${SchemaModuleTypeEnums.ORDER_MODULE}:${SchemaModuleEntityTypeEnums.ORDER}`;
        orderCreate.title = 'Test Order';
        orderCreate.properties = {
            IssuedDate: moment().format('YYYY-MM-DD'),
            RequestedDeliveryDate: undefined,
            ActivationStatus: 'DRAFT',
            BillingTerms: 'NET_3',
            CurrencyCode: 'GBP',
            UDPRN: 100000,
            UMPRN: 100000,
        };

        const res = await dbService.updateOrCreateDbRecordsByPrincipal(
            principal,
            [ orderCreate ],
            { upsert: true },
        );

        expect(res).toHaveLength(1);

        const record = await dbService.getDbRecordTransformedByOrganizationAndId(principal.organization, res[0].id);

        expect(getProperty(record, 'BillingTerms')).toBe(orderCreate.properties['BillingTerms']);
        expect(getProperty(record, 'ActivationStatus')).toBe(orderCreate.properties['ActivationStatus']);

        order = record;

        done();
    });

    test('should process order for billing', async (done) => {

        const orderId = 'd9841b62-f9c3-4719-a38f-38971888c1a7';

        const body = {
            BillingStartDate: moment().subtract(18, 'months').subtract(1, 'days').format('YYYY-MM-DD'),
            ContractStartDate: moment().subtract(18, 'months').subtract(1, 'days').format('YYYY-MM-DD'),
        };

        const processed = await orderService.processOrderForBilling(principal, orderId, body);

        console.log('processed', processed);

        done();
    });


    test('should delete a dbRecord by id', async (done) => {

        const res = await dbService.deleteByPrincipalAndId(principal, order.id);
        expect(res[0].affected).toBe(1);

        done();
    });

    afterAll(async () => {
        await app.close();
    });
});
