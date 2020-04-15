import { APIClient } from '@d19n/client/dist/common/APIClient';
import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { schemaManagerEntities } from '@d19n/models/dist/schema-manager/entities';
import { DbModule } from '@d19n/schema-manager/dist/db/db.module';
import { DbService } from '@d19n/schema-manager/dist/db/db.service';
import { AuthUserHelper } from '@d19n/schema-manager/dist/helpers/AuthUserHelper';
import { SchemasModule } from '@d19n/schema-manager/dist/schemas/schemas.module';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { v4 as uuidv4 } from 'uuid';
import { FeaturesModule } from '../../features/features.module';
import { JiraModule } from '../../integrations/jira/jira.module';
import { GisFtthFeaturesService } from './gis.ftth.features.service';

dotenv.config();
jest.setTimeout(100000);

describe('GIS Ftth Service', () => {

    let principal: OrganizationUserEntity;

    let dbService: DbService;
    let service: GisFtthFeaturesService;
    let uuid;

    beforeEach(async () => {

        uuid = uuidv4();

        const moduleRef = await Test.createTestingModule({
            imports: [
                DbModule,
                SchemasModule,
                FeaturesModule,
                JiraModule,
                TypeOrmModule.forRoot({
                    type: 'postgres',
                    host: process.env.DB_HOSTNAME,
                    port: Number.parseInt(process.env.DB_PORT),
                    username: process.env.DB_USERNAME,
                    password: process.env.DB_PASSWORD,
                    database: process.env.DB_NAME,
                    keepConnectionAlive: true,
                    namingStrategy: new SnakeNamingStrategy(),
                    subscribers: [],
                    entities: schemaManagerEntities,
                }),
                TypeOrmModule.forRoot({
                    type: 'postgres',
                    name: 'myahDatabase',
                    keepConnectionAlive: true,
                    host: process.env.DB_MYAH_HOSTNAME || 'localhost',
                    port: Number.parseInt(process.env.MYAH_DB_PORT) || 5432,
                    username: process.env.DB_MYAH_USERNAME || 'posrgres',
                    password: process.env.DB_MYAH_PASSWORD || 'postgres',
                    database: process.env.DB_MYAH_NAME || 'myah',
                }),
                TypeOrmModule.forRoot({
                    type: 'postgres',
                    name: 'cosmosDatabase',
                    keepConnectionAlive: true,
                    host: process.env.DB_GIS_HOSTNAME || 'localhost',
                    port: Number.parseInt(process.env.DB_GIS_PORT) || 5432,
                    username: process.env.DB_GIS_USERNAME || 'postgres',
                    password: process.env.DB_GIS_PASSWORD || 'postgres',
                    database: process.env.DB_GIS_NAME || 'cosmos',
                }),
            ],
            providers: [ GisFtthFeaturesService ],
        }).compile();

        const login = await AuthUserHelper.login();
        principal = await APIClient.call<OrganizationUserEntity>({
            facility: 'http',
            baseUrl: Utilities.getBaseUrl(SERVICE_NAME.IDENTITY_MODULE),
            service: 'v1.0/users/my',
            method: 'get',
            headers: { Authorization: login.headers.authorization },
            debug: false,
        });

        service = moduleRef.get<GisFtthFeaturesService>(GisFtthFeaturesService);
        dbService = moduleRef.get<DbService>(DbService);
    });

    describe('create features from myah database', () => {

        it('should create feature in Odin from a feature in Myah', async (done) => {

            const featureId = 12232497;
            const featureType = 'PIA_DUCT';

            const res = await service.importFeatureFromGis(principal, featureType, featureId);
            console.log('res', res);

            done();
        });

    })

    describe('create features from cosmos database', () => {

        it('should create feature in Odin from a feature in Cosmos', async (done) => {

            const featureId = 3093;
            const featureType = 'CLOSURE';

            const res = await service.importFeatureFromGis(principal, featureType, featureId);
            console.log('res', res);

            done();
        });

    })


    describe('create features in Odin from cosmos audit events', () => {

        it('should create feature in Odin from a feature in Cosmos', async (done) => {

            const featureId = 3093;
            const featureType = 'CLOSURE';

            const res = await service.importFeatureFromGis(principal, featureType, featureId);
            console.log('res', res);

            done();
        });

    })

    describe('should update, create, delete features in cosmos from feature events from Odin', () => {

        let closureId;

        it('should create a CLOSURE feature in cosmos from a feature in Odin', async (done) => {

            const create = new DbRecordCreateUpdateDto();
            create.entity = 'ProjectModule:Feature';
            create.type = 'CLOSURE';
            create.title = 'Test Closure';
            create.properties = {
                JiraProjectKey: 'TEST',
                ClosureType: 1,
                ClosureModel: 2,
                Description: 'ODIN TESTING',
                BuildStatus: undefined,
                Coordinates: '443208.15465371654,540237.3035855447',
                ExternalRef: uuid,
            };

            // uuid c675dd1e-1dbd-4fea-84bd-5846eddccfe6

            const createRes = await dbService.updateOrCreateDbRecordsByPrincipal(principal, [ create ]);
            console.log('createRes', createRes);

            const res = await service.createFeature(principal, createRes[0].id);

            console.log('res', res);

            closureId = createRes[0].id

            done();
        });

        it('should create a BLOCKAGE feature in cosmos from a feature in Odin', async (done) => {

            const create = new DbRecordCreateUpdateDto();
            create.entity = 'ProjectModule:Feature';
            create.type = 'BLOCKAGE';
            create.title = 'Test Blockage';
            create.properties = {
                Coordinates: '443208.15465371654,540237.3035855447',
                Description: 'ODIN TESTING',
                BuildStatus: 1,
                BlockageModel: 1,
                ExternalRef: uuid,
            };

            const createRes = await dbService.updateOrCreateDbRecordsByPrincipal(principal, [ create ]);
            console.log('createRes', createRes);

            const res = await service.createFeature(principal, createRes[0].id);

            console.log('res', res);

            done();
        });


        it('should update a feature in cosmos from a feature in Odin', async (done) => {

            const update = new DbRecordCreateUpdateDto();
            update.entity = 'ProjectModule:Feature';
            update.properties = {
                Description: 'ODIN TESTING REVISION',
                BuildStatus: 3,
            };

            const updateRes = await dbService.updateDbRecordsByPrincipalAndId(principal, closureId, update);
            console.log('updateRes', updateRes);

            const res = await service.updateFeature(principal, updateRes.id);
            console.log('res', res);

            done();
        });

        it('should delete feature in cosmos from a feature in Odin', async (done) => {

            const deleteRes = await dbService.deleteByPrincipalAndId(principal, closureId);
            console.log('deleteRes', deleteRes);

            const res = await service.deleteFeature(principal, deleteRes[0].id);
            console.log('res', res);

            done();
        });

    });

})
