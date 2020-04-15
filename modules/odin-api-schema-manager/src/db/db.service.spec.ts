import { APIClient } from '@d19n/client/dist/common/APIClient';
import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { PipelineEntity } from '@d19n/models/dist/schema-manager/pipeline/pipeline.entity';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { forwardRef } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import faker from 'faker';
import moment from 'moment';
import { AwsS3Module } from '../files/awsS3/awsS3.module';
import { AuthUserHelper } from '../helpers/AuthUserHelper';
import { TestModuleConfig } from '../helpers/tests/TestModuleConfig';
import { LogsUserActivityModule } from '../logs/user-activity/logs.user.activity.module';
import { PipelineEntitysStagesModule } from '../pipelines/stages/pipelines.stages.module';
import { SchemasModule } from '../schemas/schemas.module';
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

describe('Db service', () => {

  let dbService: DbService;

  let principal: OrganizationUserEntity;
  let dbRecord: DbRecordEntityTransform;
  let pipeline: PipelineEntity;

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

    dbService = app.get<DbService>(DbService);

    login = await AuthUserHelper.login();
    principal = await APIClient.call<OrganizationUserEntity>({
      facility: 'http',
      baseUrl: Utilities.getBaseUrl(SERVICE_NAME.IDENTITY_MODULE),
      service: 'v1.0/users/my',
      method: 'get',
      headers: { Authorization: login.headers.authorization },
      debug: false,
    });

    pipeline = await APIClient.call<PipelineEntity>({
      facility: 'http',
      baseUrl: Utilities.getBaseUrl(SERVICE_NAME.SCHEMA_MODULE),
      service: `v1.0/pipelines/bymodule/${SchemaModuleTypeEnums.CRM_MODULE}/${SchemaModuleEntityTypeEnums.LEAD}`,
      method: 'get',
      headers: { Authorization: login.headers.authorization },
      debug: false,
    });

   

  });

  test('should have public methods', (done) => {
    expect(dbService.searchDbRecordsByPrincipal).toBeDefined();
    expect(dbService.batchCreate).toBeDefined();
    expect(dbService.updateOrCreateDbRecordsByPrincipal).toBeDefined();
    expect(dbService.updateDbRecordsByPrincipalAndId).toBeDefined();
    expect(dbService.getManyDbRecordsByOrganizationAndIds).toBeDefined();
    expect(dbService.getDbRecordsByOrganizationAndId).toBeDefined();
    expect(dbService.getDbRecordTransformedByOrganizationAndExternalId).toBeDefined();
    expect(dbService.getDbRecordTransformedByOrganizationAndId).toBeDefined();
    expect(dbService.mergeRecordsByOrganization).toBeDefined();
    expect(dbService.deleteByPrincipalAndId).toBeDefined();
    done();
  });

  test('should create a lead with single quotes in the title', async (done) => {

    console.log('dbService', dbService);

    // try {
    const create = new DbRecordCreateUpdateDto();
    create.entity = `${SchemaModuleTypeEnums.CRM_MODULE}:${SchemaModuleEntityTypeEnums.LEAD}`;
    create.title = `. + ' * ' ? [ ^ ] $ '''''( ) { } = ! < > | : - Test Address ${faker.random.word()}`;
    create.properties = {
      Type: 'BUSINESS',
      Source: 'WEBSITE',
    };

    const res1 = await dbService.updateOrCreateDbRecordsByPrincipal(
      principal,
      [ create ],
      { upsert: true },
    );

    console.log('res1', res1);

    expect(res1).toHaveLength(1);

    done();

  });


  test('should create a note with single quotes', async (done) => {

    // try {
    const recordOne = new DbRecordCreateUpdateDto();
    recordOne.entity = `${SchemaModuleTypeEnums.SUPPORT_MODULE}:${SchemaModuleEntityTypeEnums.NOTE}`;
    recordOne.properties = {
      Body: 'This is a test with single quotes \' between  i\'ll',
    };

    const recordTwo = new DbRecordCreateUpdateDto();
    recordTwo.entity = `${SchemaModuleTypeEnums.SUPPORT_MODULE}:${SchemaModuleEntityTypeEnums.NOTE}`;
    recordTwo.properties = {
      Body: '2021',
    };

    const recordThree = new DbRecordCreateUpdateDto();
    recordThree.entity = `${SchemaModuleTypeEnums.SUPPORT_MODULE}:${SchemaModuleEntityTypeEnums.NOTE}`;
    recordThree.properties = {
      Body: 2021,
    };

    const res1 = await dbService.updateOrCreateDbRecordsByPrincipal(
      principal,
      [ recordOne, recordTwo, recordThree ],
      { upsert: true },
    );

    expect(res1).toHaveLength(3);

    done();

  });

  test('expect status to be 422 when passing in undefined for a required property', async (done) => {

    const recordFive = new DbRecordCreateUpdateDto();
    recordFive.entity = `${SchemaModuleTypeEnums.SUPPORT_MODULE}:${SchemaModuleEntityTypeEnums.NOTE}`;
    recordFive.properties = {
      Body: undefined,
    };

    try {

      await dbService.updateOrCreateDbRecordsByPrincipal(
        principal,
        [ recordFive ],
        { upsert: true },
      );

    } catch (e) {
      console.error(e)
      expect(e.statusCode).toBe(422)
    }

    done();

  })

  test('should batch create two dbRecord(s)', async (done) => {
    const recordOne = new DbRecordCreateUpdateDto();
    recordOne.entity = `${SchemaModuleTypeEnums.CRM_MODULE}:${SchemaModuleEntityTypeEnums.LEAD}`;
    const firstName1 = faker.name.firstName();
    const lastName1 = faker.name.lastName();
    recordOne.title = `${firstName1} ${lastName1}`;
    recordOne.properties = {
      Name: faker.name.lastName(),
      EmailAddress: faker.random.word() + faker.internet.email(),
      Type:'RESIDENTIAL',
      Source:'WEBSITE'
    };
    // recordOne.title = 'Test Title Record 3';
    // recordOne.properties = {
    //   Name: faker.address.streetAddress(),
    //   Type: 'RESIDENTIAL',
    //   Source: 'WEBSITE',
    //   EmailAddress: faker.random.word() + faker.internet.email(),
    // };

    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();

    const recordTwo = new DbRecordCreateUpdateDto();
    recordTwo.entity = `${SchemaModuleTypeEnums.CRM_MODULE}:${SchemaModuleEntityTypeEnums.CONTACT}`;
    recordTwo.title = `${firstName} ${lastName}`;
    recordTwo.properties = {
      FirstName: faker.name.firstName(),
      LastName: faker.name.lastName(),
      EmailAddress: faker.random.word() + faker.internet.email(),
    };

    const res = await dbService.updateOrCreateDbRecordsByPrincipal(
      principal,
      [ recordOne, recordTwo ],
      { upsert: true },
    );

    expect(res).toHaveLength(2);

    const records = await dbService.getManyDbRecordsByOrganizationAndIds(
      principal.organization,
      { recordIds: res.map(elem => elem.id) },
    );

    const lead = await dbService.getDbRecordTransformedByOrganizationAndId(
      principal.organization,
      records.find(elem => elem.entity === recordOne.entity).id,
      [ SchemaModuleEntityTypeEnums.CONTACT ],
    );

    console.log('lead', lead);

    const emailFromCreate = recordOne.properties['EmailAddress'].toLowerCase();
    const emailFromNewRecord = getProperty(lead, 'EmailAddress');

    expect(emailFromNewRecord).toBe(emailFromCreate);

    done();
  });


  test('should batch create one or many dbRecord(s)', async (done) => {
    const dbRecordCreateUpdate = new DbRecordCreateUpdateDto();
    dbRecordCreateUpdate.entity = `${SchemaModuleTypeEnums.CRM_MODULE}:${SchemaModuleEntityTypeEnums.LEAD}`;
    dbRecordCreateUpdate.title = faker.address.streetAddress();
    dbRecordCreateUpdate.properties = {
      Type: 'RESIDENTIAL',
      Source: 'WEBSITE',
      EmailAddress: faker.internet.email(),
      TotalValue: 10,
    };

    const res = await dbService.updateOrCreateDbRecordsByPrincipal(
      principal,
      [ dbRecordCreateUpdate ],
    );

    expect(res).toHaveLength(1);

    const record = await dbService.getDbRecordTransformedByOrganizationAndId(principal.organization, res[0].id, []);

    const emailFromCreate = dbRecordCreateUpdate.properties['EmailAddress'].toLowerCase();
    const emailFromNewRecord = getProperty(record, 'EmailAddress');

    expect(getProperty(record, 'Type')).toBe(dbRecordCreateUpdate.properties['Type']);
    expect(getProperty(record, 'Source')).toBe(dbRecordCreateUpdate.properties['Source']);
    expect(emailFromNewRecord).toBe(emailFromCreate);


    dbRecord = record;

    done();
  });


  test('should create a new order and update multiple values', async (done) => {

    const orderCreate = new DbRecordCreateUpdateDto();
    orderCreate.entity = `${SchemaModuleTypeEnums.ORDER_MODULE}:${SchemaModuleEntityTypeEnums.ORDER}`;
    orderCreate.title = faker.address.streetAddress();
    orderCreate.properties = {
      IssuedDate: moment().format('YYYY-MM-DD'),
      RequestedDeliveryDate: undefined,
      ActivationStatus: 'DRAFT',
      BillingTerms: 'NET_3',
      CurrencyCode: 'GBP',
      Subtotal: '0.00',
      UDPRN: 100000,
      UMPRN: 100000,
    };

    const res = await dbService.updateOrCreateDbRecordsByPrincipal(
      principal,
      [ orderCreate ],
      { upsert: true },
    );

    expect(res).toHaveLength(1);

    const record = await dbService.getDbRecordTransformedByOrganizationAndId(principal.organization, res[0].id, []);

    expect(getProperty(record, 'BillingTerms')).toBe(orderCreate.properties['BillingTerms']);
    expect(getProperty(record, 'ActivationStatus')).toBe(orderCreate.properties['ActivationStatus']);


    const orderUpdate = new DbRecordCreateUpdateDto();
    orderUpdate.entity = `${SchemaModuleTypeEnums.ORDER_MODULE}:${SchemaModuleEntityTypeEnums.ORDER}`;
    orderUpdate.title = faker.address.streetAddress();
    orderUpdate.properties = {
      ActivationStatus: 'DRAFT',
      BillingTerms: 'NET_3',
      Subtotal: '12.00',
      TotalPrice: '12.00',
    };

    const update = await dbService.updateDbRecordsByPrincipalAndId(
      principal,
      record.id,
      orderUpdate,
    );

    const orderUpdate2 = new DbRecordCreateUpdateDto();
    orderUpdate2.entity = `${SchemaModuleTypeEnums.ORDER_MODULE}:${SchemaModuleEntityTypeEnums.ORDER}`;
    orderUpdate2.title = faker.address.streetAddress();
    orderUpdate2.properties = {
      ActivationStatus: 'DRAFT',
      BillingTerms: 'NET_3',
      TotalDiscounts: '200.00',
      TotalTaxAmount: '200.00',
      TotalPrice: '200.00',
    };

    const update2 = await dbService.updateDbRecordsByPrincipalAndId(
      principal,
      record.id,
      orderUpdate2,
    );

    const createdRecord = await dbService.getDbRecordsByOrganizationAndId(principal.organization, res[0].id);
    const updatedRecord = await dbService.getDbRecordsByOrganizationAndId(principal.organization, update.id);
    const updatedRecord2 = await dbService.getDbRecordsByOrganizationAndId(principal.organization, update2.id);

    console.log('createdRecord', createdRecord.columns.length);
    console.log('updatedRecord', updatedRecord.columns.length);
    console.log('updatedRecord2', updatedRecord2.columns.length);
    console.log('res', res);
    console.log('update', update);
    console.log('update2', update2);

    done();
  });


  test('should return a 409 when a dbRecord the unique column exists', async (done) => {
    const dbRecordCreateUpdate = new DbRecordCreateUpdateDto();
    dbRecordCreateUpdate.entity = `${SchemaModuleTypeEnums.CRM_MODULE}:${SchemaModuleEntityTypeEnums.LEAD}`;
    dbRecordCreateUpdate.title = dbRecord.title;
    dbRecordCreateUpdate.properties = {
      Type: getProperty(dbRecord, 'Type'),
      Source: getProperty(dbRecord, 'Source'),
      EmailAddress: getProperty(dbRecord, 'EmailAddress'),
    };

    try {

      const res = await dbService.updateOrCreateDbRecordsByPrincipal(
        principal,
        [ dbRecordCreateUpdate ],
        { upsert: false },
      );

      console.log(res);
    } catch (e) {

      console.error(e);
      expect(e.statusCode).toBe(409);

    }

    done();

  });

  test('should update a record property', async (done) => {
    const dbRecordCreateUpdate = new DbRecordCreateUpdateDto();
    dbRecordCreateUpdate.entity = `${SchemaModuleTypeEnums.CRM_MODULE}:${SchemaModuleEntityTypeEnums.LEAD}`;
    dbRecordCreateUpdate.properties = {
      Name: 'name rev 1',
      TotalValue: 0,
    };

    const res = await dbService.updateDbRecordsByPrincipalAndId(principal, dbRecord.id, dbRecordCreateUpdate);
    const record = await dbService.getDbRecordTransformedByOrganizationAndId(principal.organization, res.id, []);

    expect(getProperty(record, 'Name')).toBe(dbRecordCreateUpdate.properties['Name']);

    done();
  });

  test('should try to update a record property with the same value', async (done) => {
    const dbRecordCreateUpdate = new DbRecordCreateUpdateDto();
    dbRecordCreateUpdate.entity = `${SchemaModuleTypeEnums.CRM_MODULE}:${SchemaModuleEntityTypeEnums.LEAD}`;
    dbRecordCreateUpdate.properties = {
      Name: 'name rev 1',
      TotalValue: 0,
    };

    const res = await dbService.updateDbRecordsByPrincipalAndId(principal, dbRecord.id, dbRecordCreateUpdate);
    const record = await dbService.getDbRecordTransformedByOrganizationAndId(principal.organization, res.id, []);

    expect(getProperty(record, 'Name')).toBe(dbRecordCreateUpdate.properties['Name']);

    done();
  });

  test('should update a record title', async (done) => {
    const dbRecordCreateUpdate = new DbRecordCreateUpdateDto();
    dbRecordCreateUpdate.entity = `${SchemaModuleTypeEnums.CRM_MODULE}:${SchemaModuleEntityTypeEnums.LEAD}`;
    dbRecordCreateUpdate.title = 'NEW_LEAD_TITLE';

    const res = await dbService.updateDbRecordsByPrincipalAndId(principal, dbRecord.id, dbRecordCreateUpdate);
    const record = await dbService.getDbRecordTransformedByOrganizationAndId(principal.organization, res.id, []);

    expect(record.title).toBe(dbRecordCreateUpdate.title);

    done();
  });

  test('should try to update a record title with the same value', async (done) => {
    const dbRecordCreateUpdate = new DbRecordCreateUpdateDto();
    dbRecordCreateUpdate.entity = `${SchemaModuleTypeEnums.CRM_MODULE}:${SchemaModuleEntityTypeEnums.LEAD}`;
    dbRecordCreateUpdate.title = 'NEW_LEAD_TITLE';

    const res = await dbService.updateDbRecordsByPrincipalAndId(principal, dbRecord.id, dbRecordCreateUpdate);
    const record = await dbService.getDbRecordTransformedByOrganizationAndId(principal.organization, res.id, []);

    expect(record.title).toBe(dbRecordCreateUpdate.title);

    done();
  });

  test('should return a 409 when a the schema does not match', async (done) => {

    const dbRecordCreateUpdate = new DbRecordCreateUpdateDto();
    dbRecordCreateUpdate.entity = `${SchemaModuleTypeEnums.CRM_MODULE}:${SchemaModuleEntityTypeEnums.ACCOUNT}`;
    dbRecordCreateUpdate.title = 'SCHEMA_DOES_NOT_MATCH';

    try {

      await dbService.updateDbRecordsByPrincipalAndId(principal, dbRecord.id, dbRecordCreateUpdate);

    } catch (e) {
      expect(e.statusCode).toBe(409);
    }
    done();
  });


  test('should change a records stage with no properties', async (done) => {

    const nextStage = pipeline[0].stages[1];
    const dbRecordCreateUpdate = new DbRecordCreateUpdateDto();
    dbRecordCreateUpdate.entity = `${SchemaModuleTypeEnums.CRM_MODULE}:${SchemaModuleEntityTypeEnums.LEAD}`;
    dbRecordCreateUpdate.stageId = nextStage.id;

    const res = await dbService.updateDbRecordsByPrincipalAndId(principal, dbRecord.id, dbRecordCreateUpdate);
    const record = await dbService.getDbRecordTransformedByOrganizationAndId(principal.organization, res.id, []);

    expect(record.stage.id).toBe(dbRecordCreateUpdate.stageId);

    done();
  });

  test('should change a records stage with properties to update the record', async (done) => {
    const nextStage = pipeline[0].stages[2];
    const dbRecordCreateUpdate = new DbRecordCreateUpdateDto();
    dbRecordCreateUpdate.entity = `${SchemaModuleTypeEnums.CRM_MODULE}:${SchemaModuleEntityTypeEnums.LEAD}`;
    dbRecordCreateUpdate.stageId = nextStage.id;
    dbRecordCreateUpdate.properties = {
      Name: 'name rev 2',
    };

    const res = await dbService.updateDbRecordsByPrincipalAndId(principal, dbRecord.id, dbRecordCreateUpdate);
    const record = await dbService.getDbRecordTransformedByOrganizationAndId(principal.organization, res.id, []);
    expect(record.stage.id).toBe(dbRecordCreateUpdate.stageId);
    expect(getProperty(record, 'Name')).toBe(dbRecordCreateUpdate.properties['Name']);

    done();
  });


  test('should delete a dbRecord by id', async (done) => {

    const res = await dbService.deleteByPrincipalAndId(principal, dbRecord.id);
    expect(res[0].affected).toBe(1);

    done();
  });

  test('should get deleted record by id', async (done) => {

    console.log('dbRecord', dbRecord.id);

    const res = await dbService.getDeletedDbRecordById(principal.organization, dbRecord.id);
    expect(res.id).toBe(dbRecord.id);

    done();
  });

  afterAll(async () => {
    await app.close();
  });
});
