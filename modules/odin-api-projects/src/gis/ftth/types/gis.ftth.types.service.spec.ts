import { APIClient } from '@d19n/client/dist/common/APIClient';
import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { schemaManagerEntities } from '@d19n/models/dist/schema-manager/entities';
import { AuthUserHelper } from '@d19n/schema-manager/dist/helpers/AuthUserHelper';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { FeaturesModule } from '../../../features/features.module';
import { FtthTypeDto } from './dto/ftth-type.dto';
import { GisFtthTypesService } from './gis.ftth.types.service';

dotenv.config();
jest.setTimeout(30000);

describe('GIS Ftth Cable Service', () => {

    let principal: OrganizationUserEntity;

    let service: GisFtthTypesService;
    let cableId;

    beforeEach(async () => {

        const moduleRef = await Test.createTestingModule({
            imports: [
                FeaturesModule,
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
                    name: 'cosmosDatabase',
                    keepConnectionAlive: true,
                    host: process.env.DB_GIS_HOSTNAME || 'localhost',
                    port: Number.parseInt(process.env.DB_GIS_PORT) || 5432,
                    username: process.env.DB_GIS_USERNAME || 'postgres',
                    password: process.env.DB_GIS_PASSWORD || 'postgres',
                    database: process.env.DB_GIS_NAME || 'cosmos',
                }),
            ],
            providers: [ GisFtthTypesService ],
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

        service = moduleRef.get<GisFtthTypesService>(GisFtthTypesService);
    });

    describe('managing ftth types', () => {

        it('should create a new type by feature', async (done) => {

            const featureName = 'closure';

            const body = new FtthTypeDto();
            body.name = 'TEST_1';


            const res = await service.create(principal, featureName, body);

            console.log('res', res);

            cableId = res.id;

            done();
        });


        it('should update a type', async (done) => {

            const featureName = 'closure';

            const body = new FtthTypeDto();
            body.name = 'TEST_1';

            const res = await service.updateById(principal, featureName, body);

            console.log('res', res);

            done();
        });

        it('should delete a type if not in use', async (done) => {

            const featureName = 'closure';

            const body = new FtthTypeDto();
            body.name = 'TEST_1';

            const res = await service.deleteById(principal, featureName, body);

            console.log('res', res);

            done();
        });
    });

})
