import { APIClient } from '@d19n/client/dist/common/APIClient';
import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbModule } from '@d19n/schema-manager/dist/db/db.module';
import { AuthUserHelper } from '@d19n/schema-manager/dist/helpers/AuthUserHelper';
import { TestModuleConfig } from '@d19n/schema-manager/dist/helpers/tests/TestModuleConfig';
import { SchemasModule } from '@d19n/schema-manager/dist/schemas/schemas.module';
import { TestingModule } from '@nestjs/testing';
import { NetworkAdtranOnuDataService } from './network.adtran.onu.data.service';


jest.setTimeout(30000);

describe('Network Adtran Ont data Service', () => {
    let networkOntService: NetworkAdtranOnuDataService;
    let principal: OrganizationUserEntity;

    let app: TestingModule;

    const oltIp = '172.17.0.200';

    const serialNumber = 'ADTN12345678';
    const port = '16';

    beforeAll(async () => {
        app = await new TestModuleConfig([
            DbModule,
            SchemasModule,
        ], [
            NetworkAdtranOnuDataService,
        ], []).initialize();

        const login = await AuthUserHelper.login();
        principal = await APIClient.call<OrganizationUserEntity>({
            facility: 'http',
            baseUrl: Utilities.getBaseUrl(SERVICE_NAME.IDENTITY_MODULE),
            service: 'v1.0/users/my',
            method: 'get',
            headers: { Authorization: login.headers.authorization },
            debug: false,
        });

        networkOntService = app.get<NetworkAdtranOnuDataService>(NetworkAdtranOnuDataService);
    });


    describe('public methods', () => {
        it('all methods should be defined', (done) => {
            expect(networkOntService.activateServiceByOrderItemId).toBeDefined();
            expect(networkOntService.deactivateServiceByOrderItemId).toBeDefined();
            expect(networkOntService.checkServiceByOrderItemId).toBeDefined();
            done();
        });
    });

    describe('activateService', () => {
        it('should activate the service', async (done) => {

            const config = await networkOntService.activateServiceByOrderItemId(principal, oltIp);

            console.log(config);

            done();
        })
    })

    describe('checkServiceByOrderItem', () => {
        it('should deactivate the service', async (done) => {

            const config = await networkOntService.checkServiceByOrderItemId(principal, oltIp);

            console.log(config);

            done();
        })
    })

    describe('activateService', () => {
        it('should deactivate the service', async (done) => {

            const config = await networkOntService.deactivateServiceByOrderItemId(principal, oltIp);

            console.log(config);

            done();
        })
    })


    afterAll(async () => {
        await app.close();
    });
});
