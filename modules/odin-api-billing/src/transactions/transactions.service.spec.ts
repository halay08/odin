import { APIClient } from '@d19n/client/dist/common/APIClient';
import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbModule } from '@d19n/schema-manager/dist/db/db.module';
import { AuthUserHelper } from '@d19n/schema-manager/dist/helpers/AuthUserHelper';
import { TestModuleConfig } from '@d19n/schema-manager/dist/helpers/tests/TestModuleConfig';
import { SchemasModule } from '@d19n/schema-manager/dist/schemas/schemas.module';
import { TestingModule } from '@nestjs/testing';
import { GocardlessModule } from '../gocardless/gocardless.module';
import { GocardlessPaymentEntity } from '../gocardless/payments/types/gocardless.payment.entity';
import { GocardlessEventEntity } from '../gocardless/webhook/events/types/gocardless.event.entity';
import { TransactionsService } from './transactions.service';

jest.setTimeout(30000);

describe('Transactions service', () => {

    let principal: OrganizationUserEntity;

    let service: TransactionsService;
    let app: TestingModule;

    beforeEach(async () => {

        app = await new TestModuleConfig([

            SchemasModule,
            GocardlessModule,
            DbModule,

        ], [
            TransactionsService,
        ], [ GocardlessEventEntity ]).initialize();


        const login = await AuthUserHelper.login();
        principal = await APIClient.call<OrganizationUserEntity>({
            facility: 'http',
            baseUrl: Utilities.getBaseUrl(SERVICE_NAME.IDENTITY_MODULE),
            service: 'v1.0/users/my',
            method: 'get',
            headers: { Authorization: login.headers.authorization },
            debug: false,
        });

        service = app.get<TransactionsService>(TransactionsService);
    });

    describe('validate Number() conditions', () => {

        it('should convert dollars to cents', async (done) => {

            const gocardlessPayment = new GocardlessPaymentEntity();
            const amount = gocardlessPayment.convertToCents('33.30');

            expect(amount).toBe(3300);

            done();
        });

        it('should be greater than .1', async (done) => {

            const bal2 = Number(1) - (Number(99) / 100);
            const val2 = Number(Number(bal2).toPrecision(10)).toFixed(2);

            expect(Number(val2)).toBeGreaterThanOrEqual(.01);

            done();
        });

    });

})
