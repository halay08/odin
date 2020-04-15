import { APIClient } from '@d19n/client/dist/common/APIClient';
import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getAllRelations } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { DbModule } from '@d19n/schema-manager/dist/db/db.module';
import { DbService } from '@d19n/schema-manager/dist/db/db.service';
import { AuthUserHelper } from '@d19n/schema-manager/dist/helpers/AuthUserHelper';
import { TestModuleConfig } from '@d19n/schema-manager/dist/helpers/tests/TestModuleConfig';
import { SchemasModule } from '@d19n/schema-manager/dist/schemas/schemas.module';
import { forwardRef } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { OrdersModule } from '../orders.module';
import { OrdersItemsService } from './orders.items.service';
import moment = require('moment');

jest.setTimeout(30000);

describe('Orders Items service', () => {

    let dbService: DbService;
    let ordersItemsService: OrdersItemsService;

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
            SchemasModule,
            DbModule,
            forwardRef(() => OrdersModule),
        ], [
            OrdersItemsService,
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

        ordersItemsService = app.get<OrdersItemsService>(OrdersItemsService);
        dbService = app.get<DbService>(DbService);

    });

    test('should have public methods', (done) => {
        expect(ordersItemsService.amendOrderItemProductById).toBeDefined();
        expect(ordersItemsService.createOrderItemsFromProducts).toBeDefined();
        expect(ordersItemsService.computeOrderTotalFromOrderItem).toBeDefined();
        expect(ordersItemsService.processOrderItemsForBilling).toBeDefined();
        expect(ordersItemsService.removeDiscountByPrincipal).toBeDefined();
        done();
    });


    test('should process order item for billing', async (done) => {

        const orderId = 'd9841b62-f9c3-4719-a38f-38971888c1a7';
        const order = await dbService.getDbRecordTransformedByOrganizationAndId(
            principal.organization,
            orderId,
            [ 'OrderItem' ],
        );

        const update = new DbRecordCreateUpdateDto();
        update.entity = `${SchemaModuleTypeEnums.ORDER_MODULE}:${SchemaModuleEntityTypeEnums.ORDER}`;
        update.properties = {
            BillingStartDate: moment().subtract(1, 'months').subtract(0, 'days').format('YYYY-MM-DD'),
            ContractStartDate: moment().subtract(1, 'months').subtract(0, 'days').format('YYYY-MM-DD'),
        };

        console.log('update', update);

        const res = await dbService.updateDbRecordsByPrincipalAndId(
            principal,
            orderId,
            update,
        );

        console.log('res', res);

        const orderItems = getAllRelations(order, 'OrderItem');
        const orderItemIds = orderItems.map(elem => elem.id);

        const processed = await ordersItemsService.processOrderItemsForBilling(principal, orderId, orderItemIds);

        console.log('processed', processed);

        done();
    });

    afterAll(async () => {
        await app.close();
    });
});
