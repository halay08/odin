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
import { SchemasModule } from '@d19n/schema-manager/dist/schemas/schemas.module';
import { TestingModule } from '@nestjs/testing';
import { OffersService } from './offers.service';
import moment = require('moment');

jest.setTimeout(30000);

describe('Offers service', () => {

    let dbService: DbService;
    let offerService: OffersService;

    let principal: OrganizationUserEntity;

    let offer: DbRecordEntityTransform;

    let login: {
        headers: {
            authorization: string
        }
    };

    let app: TestingModule;

    beforeEach(async () => {
        app = await new TestModuleConfig([
            DbModule,
            SchemasModule,
        ], [
            OffersService,
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

        offerService = app.get<OffersService>(OffersService);
        dbService = app.get<DbService>(DbService);

    });

    test('should have public methods', (done) => {
        expect(offerService.filterSearchResults).toBeDefined();
        expect(offerService.getActiveOffer).toBeDefined();
        done();
    });

    test('should create a new offer', async (done) => {

        const offerCreate = new DbRecordCreateUpdateDto()
        offerCreate.entity = `${SchemaModuleTypeEnums.PRODUCT_MODULE}:${SchemaModuleEntityTypeEnums.OFFER}`;
        offerCreate.title = 'Marko Test Offers';
        offerCreate.properties = {
            AvailableFrom: moment().format('YYYY-MM-DD'),
            AvailableTo: moment().add('30 days').format('YYYY-MM-DD'),
            Code: 'MARCO2025',
            Channel: 'DIRECT',
            CustomerType: 'RESIDENTIAL',
            Description: 'Test offer',
        }
        const res = await dbService.updateOrCreateDbRecordsByPrincipal(principal, [ offerCreate ]);

        expect(res).toHaveLength(1);

        const record = await dbService.getDbRecordTransformedByOrganizationAndId(principal.organization, res[0].id, []);

        expect(getProperty(record, 'AvailableFrom')).toBe(offerCreate.properties['AvailableFrom']);
        expect(getProperty(record, 'AvailableTo')).toBe(offerCreate.properties['AvailableTo']);
        expect(getProperty(record, 'Code')).toBe(offerCreate.properties['Code']);
        expect(getProperty(record, 'Channel')).toBe(offerCreate.properties['Channel']);
        expect(getProperty(record, 'CustomerType')).toBe(offerCreate.properties['CustomerType']);
        expect(getProperty(record, 'Description')).toBe(offerCreate.properties['Description']);

        offer = record;

        done()
    })


    test('should get an offer by code', async (done) => {

        const code = getProperty(offer, 'Code')

        const res = await offerService.getActiveOffer(principal, 'RESIDENTIAL', code)

        console.log('Code: ', code)
        console.log('Res:', res)

        expect(res.id).toBe(offer.id)

        done()

    })


    test('should get an offer by code and product relations', async (done) => {

        const code = getProperty(offer, 'Code')

        const res = await offerService.getActiveOffer(principal, 'RESIDENTIAL', code)

        expect(res.id).toBe(offer.id)
        expect(res).toHaveProperty('Product')

        done()
    })


    test('should expire an offer', async (done) => {

        const offerUpdate = new DbRecordCreateUpdateDto()
        offerUpdate.entity = `${SchemaModuleTypeEnums.PRODUCT_MODULE}:${SchemaModuleEntityTypeEnums.OFFER}`;

        offerUpdate.properties = {
            AvailableTo: moment().subtract(7, 'days').format('YYYY-MM-DD'),
        }

        const updateResponse = await dbService.updateDbRecordsByPrincipalAndId(principal, offer.id, offerUpdate);

        const record = await dbService.getDbRecordTransformedByOrganizationAndId(
            principal.organization,
            updateResponse.id,
            [],
        );

        expect(getProperty(record, 'AvailableTo')).toBe(offerUpdate.properties['AvailableTo']);


        done()
    })


    test('should not be able to get an expired offer', async (done) => {

        const code = getProperty(offer, 'Code')

        let statusCode;

        const res = await offerService.getActiveOffer(principal, 'RESIDENTIAL', code)

        expect(getProperty(res, 'IsDefault')).toBe('true')

        done()
    })


    test('should get a default offer', async (done) => {

        const res = await offerService.getActiveOffer(principal, 'RESIDENTIAL')

        console.log('Res: ', res)

        expect(getProperty(res, 'IsDefault')).toBe('true')

        done()
    })

    test('should delete an offer', async (done) => {


        done()
    })


    afterAll(async () => {
        await app.close();
    });
});
