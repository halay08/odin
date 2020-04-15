import { APIClient } from '@d19n/client/dist/common/APIClient';
import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { IDbRecordCreateUpdateRes } from '@d19n/models/dist/schema-manager/db/record/interfaces/interfaces';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SchemaTypeEntity } from '@d19n/models/dist/schema-manager/schema/types/schema.type.entity';
import { forwardRef } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AwsS3Module } from '../files/awsS3/awsS3.module';
import { AuthUserHelper } from '../helpers/AuthUserHelper';
import { TestModuleConfig } from '../helpers/tests/TestModuleConfig';
import { LogsUserActivityModule } from '../logs/user-activity/logs.user.activity.module';
import { PipelineEntitysStagesModule } from '../pipelines/stages/pipelines.stages.module';
import { SchemasColumnsService } from '../schemas/columns/schemas.columns.service';
import { SchemasModule } from '../schemas/schemas.module';
import { SchemasService } from '../schemas/schemas.service';
import { SchemasTypesService } from '../schemas/types/schemas.types.service';
import { DbService } from './db.service';
import { DbServiceRabbitmqHandler } from './db.service.rabbitmq.handler';
import { DbServiceRabbitmqRpc } from './db.service.rabbitmq.rpc';
import { DbRecordAssociationsColumnsRepository } from './records/associations-columns/db.records.associations.columns.repository';
import { DbRecordsAssociationsRabbitmqHandler } from './records/associations/db.records.associations.rabbitmq.handler';
import { DbRecordsAssociationsRepository } from './records/associations/db.records.associations.repository';
import { DbRecordsAssociationsService } from './records/associations/db.records.associations.service';
import { DbRecordsAssociationsServiceInternal } from './records/associations/db.records.associations.service.internal';
import { DbRecordsColumnsRepository } from './records/columns/db.records.columns.repository';
import { DbRecordsRabbitmqHandler } from './records/db.records.rabbitmq.handler';
import { DbRecordsRepository } from './records/db.records.repository';
import { DbRecordsService } from './records/db.records.service';
import { DbRecordsServiceInternal } from './records/db.records.service.internal';
import { DbRecordsPrincipalServiceInternal } from './records/db.records.service.internal.v2';
import { DbSearchModule } from './search/db.search.module';

jest.setTimeout(30000);

describe('Db service with schema types', () => {

  let dbService: DbService;
  let schemasService: SchemasService;
  let schemasColumnsService: SchemasColumnsService;
  let schemasTypesService: SchemasTypesService;

  let principal: OrganizationUserEntity;
  let recordOne: IDbRecordCreateUpdateRes;
  let recordTwo: IDbRecordCreateUpdateRes;
  let recordThree: IDbRecordCreateUpdateRes;

  let schema: SchemaEntity;
  let schemaType1: SchemaTypeEntity;
  let schemaType2: SchemaTypeEntity;

  let login: {
    headers: {
      authorization: string
    }
  };

  let app: TestingModule;

  beforeEach(async () => {

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

    login = await AuthUserHelper.login();
    principal = await APIClient.call<OrganizationUserEntity>({
      facility: 'http',
      baseUrl: Utilities.getBaseUrl(SERVICE_NAME.IDENTITY_MODULE),
      service: 'v1.0/users/my',
      method: 'get',
      headers: { Authorization: login.headers.authorization },
      debug: false,
    });

    dbService = app.get<DbService>(DbService);
    schemasService = app.get<SchemasService>(SchemasService);
    schemasColumnsService = app.get<SchemasColumnsService>(SchemasColumnsService);
    schemasTypesService = app.get<SchemasTypesService>(SchemasTypesService);

  });


  test('should create record with a unique property', async (done) => {

    const create = new DbRecordCreateUpdateDto();
    create.entity = `ProductModule:Offer`;
    create.title = 'Test Offer';
    create.properties = {
      IsDefault: true,
      CustomerType: 'RESIDENTIAL',
      Channel: 'DIRECT',
      Code: 'TESTING',
      AvailableFrom: '2021-01-01',
    };


    const res = await dbService.updateOrCreateDbRecordsByPrincipal(principal, [ create ]);

    console.log('res', res);

    expect(res).toHaveLength(1);

    recordOne = res[0];

    done();
  });


  test('should update record isDefault property from true to false', async (done) => {

    const update = new DbRecordCreateUpdateDto();
    update.entity = `ProductModule:Offer`;
    update.properties = {
      IsDefault: false,
    };


    const res = await dbService.updateDbRecordsByPrincipalAndId(
      principal,
      recordOne.id,
      update,
    );

    expect(res.id).toBe(recordOne.id);

    const record = await dbService.getDbRecordTransformedByOrganizationAndId(
      principal.organization,
      recordOne.id,
    );

    expect(getProperty(record, 'IsDefault')).toBe('false');


    done();
  });

  test('should delete record by id', async (done) => {

    const res = await dbService.deleteByPrincipalAndId(principal, recordOne.id);

    console.log('res', res);

    expect(res[0].affected).toBe(1);

    done();

  });


  afterAll(async () => {
    await app.close();
  });


});
