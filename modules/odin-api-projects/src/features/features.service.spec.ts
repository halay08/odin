import { APIClient } from '@d19n/client/dist/common/APIClient';
import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { getFirstRelation } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { DbModule } from '@d19n/schema-manager/dist/db/db.module';
import { DbService } from '@d19n/schema-manager/dist/db/db.service';
import { DbRecordsAssociationsService } from '@d19n/schema-manager/dist/db/records/associations/db.records.associations.service';
import { AuthUserHelper } from '@d19n/schema-manager/dist/helpers/AuthUserHelper';
import { TestModuleConfig } from '@d19n/schema-manager/dist/helpers/tests/TestModuleConfig';
import { PipelineEntitysModule } from '@d19n/schema-manager/dist/pipelines/pipelines.module';
import { PipelineEntitysStagesModule } from '@d19n/schema-manager/dist/pipelines/stages/pipelines.stages.module';
import { SchemasModule } from '@d19n/schema-manager/dist/schemas/schemas.module';
import { SchemasService } from '@d19n/schema-manager/dist/schemas/schemas.service';
import { TestingModule } from '@nestjs/testing';
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { FeaturesService } from './features.service';

dotenv.config();
jest.setTimeout(100000);

describe('Features service', () => {

    let principal: OrganizationUserEntity;

    let dbService: DbService;
    let dbAssociationsService: DbRecordsAssociationsService;
    let schemasService: SchemasService;
    let featuresService: FeaturesService;

    let uuid;

    let login: {
        headers: {
            authorization: string
        }
    };

    let app: TestingModule;

    beforeEach(async () => {

        uuid = uuidv4();

        app = await new TestModuleConfig([
            DbModule,
            SchemasModule,
            PipelineEntitysModule,
            PipelineEntitysStagesModule,
        ], [
            FeaturesService,
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

        featuresService = app.get<FeaturesService>(FeaturesService);
        dbService = app.get<DbService>(DbService);
        dbAssociationsService = app.get<DbRecordsAssociationsService>(DbRecordsAssociationsService);
        schemasService = app.get<SchemasService>(SchemasService);

    });

    describe('create feature components for a cable', () => {

        const cableId = 'fb6050b9-7b81-4ad1-afd7-add2053097f8';

        it('should create tube and fibres for a cable by cable Id', async (done) => {


            const creates = await featuresService.createFeatureComponentsFromFeatureModels(principal, cableId);

            console.log(creates);

            expect(creates.length).toBeGreaterThan(1);

            done();
        });


        it('should delete relation to record model', async (done) => {

            const feature = await dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                cableId,
                [ 'FeatureModel' ],
            );

            const model = getFirstRelation(feature, 'FeatureModel')

            const del = await dbAssociationsService.deleteByRecordId(principal, model.dbRecordAssociation.id);

            console.log(del);

            done();
        });

    })

    describe('create feature components for a closure', () => {


        const closureId = 'c9e2bd03-ed1f-44f7-9fc3-7fc358a49928';

        it('should create slots and ports for a closure by closure Id', async (done) => {

            const creates = await featuresService.createFeatureComponentsFromFeatureModels(principal, closureId);

            console.log(creates);

            expect(creates.length).toBeGreaterThan(1);

            done();
        });


        it('should delete relation to record model', async (done) => {

            const feature = await dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                closureId,
                [ 'FeatureModel' ],
            );

            const model = getFirstRelation(feature, 'FeatureModel')

            const del = await dbAssociationsService.deleteByRecordId(principal, model.dbRecordAssociation.id);

            console.log(del);

            done();
        });


    })
})
