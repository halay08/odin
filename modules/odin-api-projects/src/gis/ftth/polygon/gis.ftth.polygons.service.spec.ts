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
import { CreateFtthPolygonDto } from './dto/create-ftth-polygon.dto';
import { UpdateFtthPolygonDto } from './dto/update-ftth-polygon.dto';
import { GisFtthPolygonsService } from './gis.ftth.polygons.service';

dotenv.config();
jest.setTimeout(30000);

describe('GIS Ftth Polygon Service', () => {

    let principal: OrganizationUserEntity;

    let service: GisFtthPolygonsService;
    let polygonId;

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
            providers: [ GisFtthPolygonsService ],
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

        service = moduleRef.get<GisFtthPolygonsService>(GisFtthPolygonsService);
    });

    describe('create and delete polygons', () => {

        it('should create a new polygon ', async (done) => {


            const create = new CreateFtthPolygonDto();
            create.coordX = 443208.15465371654;
            create.coordY = 540237.3035855447;
            create.description = 'ODIN TEST';
            create.buildStatusId = 1;

            const res = await service.create(principal, create);

            console.log('res', res);

            polygonId = res.id;

            done();
        });


        it('should update a polygon build status by id', async (done) => {

            const update = new UpdateFtthPolygonDto();
            update.buildStatusId = 2;

            const res = await service.updateById(principal, polygonId, update);

            console.log('res', res);

            done();
        });

        it('should delete a polygon by id', async (done) => {

            const res = await service.deleteById(principal, polygonId);

            console.log('res', res);

            done();
        });
    });

})
