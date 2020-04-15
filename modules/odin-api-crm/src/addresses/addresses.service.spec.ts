import { APIClient } from '@d19n/client/dist/common/APIClient';
import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbModule } from '@d19n/schema-manager/dist/db/db.module';
import { AuthUserHelper } from '@d19n/schema-manager/dist/helpers/AuthUserHelper';
import { TestModuleConfig } from '@d19n/schema-manager/dist/helpers/tests/TestModuleConfig';
import { TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { PremisesModule } from '../premise/premises.module';
import { AddressesService } from './addresses.service';

dotenv.config();
jest.setTimeout(100000);

describe('Addresses service', () => {

    let principal: OrganizationUserEntity;

    let addressesService: AddressesService;

    let login: {
        headers: {
            authorization: string
        }
    };

    let app: TestingModule;

    beforeEach(async () => {

        app = await new TestModuleConfig([
            DbModule,
            PremisesModule,
            TypeOrmModule.forRoot({
                type: 'postgres',
                name: 'odinDbConnection',
                keepConnectionAlive: true,
                host: process.env.DB_HOSTNAME,
                port: Number.parseInt(process.env.DB_GIS_PORT),
                username: process.env.DB_USERNAME,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
            }),
        ], [
            AddressesService,
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

        addressesService = app.get<AddressesService>(AddressesService);

    });

    describe('enrich address', () => {

        it('enrich the address with premise data', async (done) => {

            const addressId = '8ea0ae39-a043-4bf5-b030-e63b94514280';

            const updates = await addressesService.enrichAddress(principal, addressId);

            console.log(updates);

            // expect(updates).toBeGreaterThan(1);

            done();
        });


    })
})
