import { APIClient } from '@d19n/client/dist/common/APIClient';
import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { schemaManagerEntities } from '@d19n/models/dist/schema-manager/entities';
import { DbModule } from '@d19n/schema-manager/dist/db/db.module';
import { AuthUserHelper } from '@d19n/schema-manager/dist/helpers/AuthUserHelper';
import { SchemasModule } from '@d19n/schema-manager/dist/schemas/schemas.module';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { v4 as uuidv4 } from 'uuid';
import { GisFtthModule } from '../gis.ftth.module';
import { GisFtthClosuresService } from './gis.ftth.closures.service';

dotenv.config();
jest.setTimeout(100000);

describe('GIS Ftth Closures Service', () => {

    let principal: OrganizationUserEntity;

    let service: GisFtthClosuresService;

    let uuid;

    beforeEach(async () => {

        uuid = uuidv4();

        const moduleRef = await Test.createTestingModule({
            imports: [
                GisFtthModule,
                DbModule,
                SchemasModule,
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
            providers: [ GisFtthClosuresService ],
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

        service = moduleRef.get<GisFtthClosuresService>(GisFtthClosuresService);
    });

    describe('closure cables', () => {

        it('should get all cables intersecting a closure', async (done) => {

            const closureId = 70952;

            const res = await service.getAllCablesIntersectingClosure(principal, closureId);

            console.log('res', res);

            // this closure has 3 cables
            expect(res.length).toBe(3);

            done();
        });

    })

})
