import { APIClient } from '@d19n/client/dist/common/APIClient';
import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
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
import { FeatureModelsService } from './feature.models.service';

dotenv.config();
jest.setTimeout(100000);

describe('Feature models service', () => {

    let principal: OrganizationUserEntity;

    let dbService: DbService;
    let dbAssociationsService: DbRecordsAssociationsService;
    let schemasService: SchemasService;
    let featureModelsService: FeatureModelsService;

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
            FeatureModelsService,
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

        featureModelsService = app.get<FeatureModelsService>(FeatureModelsService);
        dbService = app.get<DbService>(DbService);
        dbAssociationsService = app.get<DbRecordsAssociationsService>(DbRecordsAssociationsService);
        schemasService = app.get<SchemasService>(SchemasService);

    });

    describe('the context for the tests', () => {


    })

})
