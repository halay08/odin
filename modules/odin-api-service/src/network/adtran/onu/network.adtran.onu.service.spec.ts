import { APIClient } from '@d19n/client/dist/common/APIClient';
import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbModule } from '@d19n/schema-manager/dist/db/db.module';
import { AuthUserHelper } from '@d19n/schema-manager/dist/helpers/AuthUserHelper';
import { TestModuleConfig } from '@d19n/schema-manager/dist/helpers/tests/TestModuleConfig';
import { SchemasModule } from '@d19n/schema-manager/dist/schemas/schemas.module';
import { TestingModule } from '@nestjs/testing';
import { IActivateOnuAndDataResponse } from '../olt/interfaces/network.adtran.olt.interfaces';
import { NetworkAdtranOltModule } from '../olt/network.adtran.olt.module';
import { NetworkAdtranOnuService } from './network.adtran.onu.service';


jest.setTimeout(300000);

describe('Network Adtran ONU Service', () => {
    let networkOntService: NetworkAdtranOnuService;
    let principal: OrganizationUserEntity;

    let app: TestingModule;

    beforeAll(async () => {
        app = await new TestModuleConfig([
            DbModule,
            NetworkAdtranOltModule,
            SchemasModule,
        ], [
            NetworkAdtranOnuService,
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

        networkOntService = app.get<NetworkAdtranOnuService>(NetworkAdtranOnuService);
    });


    describe('public methods', () => {
        it('all methods should be defined', (done) => {
            expect(networkOntService.addOnu).toBeDefined();
            expect(networkOntService.removeOnu).toBeDefined();
            expect(networkOntService.checkOnuStatus).toBeDefined();
            done();
        });
    });

    describe('addOnu', () => {

        const customerDeviceId = 'a8075985-959b-4249-bb9e-5b52ba40c3d6';

        it('should add the onu', async (done) => {

            const res: IActivateOnuAndDataResponse = await networkOntService.addOnu(principal, customerDeviceId);

            console.log(res);

            done();
        })

        it('should remove the onu', async (done) => {

            const res: IActivateOnuAndDataResponse = await networkOntService.removeOnu(principal, customerDeviceId);

            console.log(res);

            done();
        })
    })


    afterAll(async () => {
        await app.close();
    });
});
