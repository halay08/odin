import { APIClient } from '@d19n/client/dist/common/APIClient';
import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { forwardRef } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createConnection } from 'typeorm';
import { AwsS3Module } from '../../files/awsS3/awsS3.module';
import { AuthUserHelper } from '../../helpers/AuthUserHelper';
import { TestModuleConfig } from '../../helpers/tests/TestModuleConfig';
import { LogsUserActivityModule } from '../../logs/user-activity/logs.user.activity.module';
import { PipelineEntitysStagesModule } from '../../pipelines/stages/pipelines.stages.module';
import { SchemasModule } from '../../schemas/schemas.module';
import { SchemasService } from '../../schemas/schemas.service';
import { DbService } from '../db.service';
import { DbServiceRabbitmqHandler } from '../db.service.rabbitmq.handler';
import { DbServiceRabbitmqRpc } from '../db.service.rabbitmq.rpc';
import { DbSearchModule } from '../search/db.search.module';
import { DbRecordAssociationsColumnsRepository } from './associations-columns/db.records.associations.columns.repository';
import { DbRecordsAssociationsRabbitmqHandler } from './associations/db.records.associations.rabbitmq.handler';
import { DbRecordsAssociationsRepository } from './associations/db.records.associations.repository';
import { DbRecordsAssociationsService } from './associations/db.records.associations.service';
import { DbRecordsAssociationsServiceInternal } from './associations/db.records.associations.service.internal';
import { DbRecordsColumnsRepository } from './columns/db.records.columns.repository';
import { DbRecordsRabbitmqHandler } from './db.records.rabbitmq.handler';
import { DbRecordsRepository } from './db.records.repository';
import { DbRecordsService } from './db.records.service';
import { DbRecordsServiceInternal } from './db.records.service.internal';
import { DbRecordsPrincipalServiceInternal } from './db.records.service.internal.v2';

jest.setTimeout(30000);

describe('DbRecordsService', () => {

  let schemasService: SchemasService;
  let dbRecordsService: DbRecordsService;
  let principal: OrganizationUserEntity;

  let app: TestingModule;
  let pg: any;

  beforeAll(async () => {

    app = await new TestModuleConfig([
      forwardRef(() => DbSearchModule),
      forwardRef(() => LogsUserActivityModule),
      forwardRef(() => SchemasModule),
      AwsS3Module,
      PipelineEntitysStagesModule,
      TypeOrmModule.forFeature([
        DbRecordAssociationsColumnsRepository,
        DbRecordsAssociationsRepository,
      ]),
    ], [
      DbService,
      DbServiceRabbitmqHandler,
      DbServiceRabbitmqRpc,
      DbRecordsRepository,
      DbRecordsColumnsRepository,
      DbRecordsServiceInternal,
      DbRecordsPrincipalServiceInternal,
      DbRecordsService,
      DbRecordsRabbitmqHandler,
      DbRecordsAssociationsService,
      DbRecordsAssociationsServiceInternal,
      DbRecordsAssociationsRabbitmqHandler,
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

    pg = await createConnection({
      type: 'postgres',
      name: 'custom',
      host: process.env.DB_HOSTNAME,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    dbRecordsService = app.get<DbRecordsService>(DbRecordsService);
    schemasService = app.get<SchemasService>(SchemasService);

  });


  describe('methods should be defined', () => {
    it('should have public methods', (done) => {
      expect(dbRecordsService.getManyDbRecordsByIds).toBeDefined();
      expect(dbRecordsService.getDbRecordById).toBeDefined();
      expect(dbRecordsService.getDbRecordByExternalId).toBeDefined();
      expect(dbRecordsService.getDbRecordsByColumnAndValues).toBeDefined();
      expect(dbRecordsService.updateOrCreateDbRecords).toBeDefined();
      expect(dbRecordsService.updateDbRecordById).toBeDefined();
      expect(dbRecordsService.deleteDbRecordById).toBeDefined();
      done();
    });
  });

  describe('Db Records service', () => {
    it('record with pipeline enabled returns full stage properties', async (done) => {

      // get the first non deleted order
      const record = await pg.query(
        'SELECT * from db_records where entity = \'OrderModule:Order\' and deleted_at IS NULL limit 1;');
      const recordId = record[0].id;

      const res = await dbRecordsService.getDbRecordById(
        principal.organization,
        recordId,
      );

      expect(res).toHaveProperty('id');
      expect(res).toHaveProperty('title');
      expect(res).toHaveProperty('recordNumber');
      expect(res).toHaveProperty('schemaId');
      expect(res).toHaveProperty('schemaTypeId');
      expect(res).toHaveProperty('createdAt');
      expect(res).toHaveProperty('updatedAt');
      expect(res).toHaveProperty('deletedAt');
      expect(res).toHaveProperty('stage');
      expect(res.stage).toHaveProperty('isSuccess');
      expect(res.stage).toHaveProperty('isDefault');
      expect(res.stage).toHaveProperty('isFail');
      expect(res.stage).toHaveProperty('key');
      expect(res.stage).toHaveProperty('position');
      expect(res).toHaveProperty('lastModifiedBy');
      expect(res).toHaveProperty('createdBy');
      expect(res).toHaveProperty('columns');

      done();
    });
  });


  afterAll(async () => {
    await app.close();
  });
});
