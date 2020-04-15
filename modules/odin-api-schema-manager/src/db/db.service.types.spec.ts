import { APIClient } from '@d19n/client/dist/common/APIClient';
import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { IDbRecordCreateUpdateRes } from '@d19n/models/dist/schema-manager/db/record/interfaces/interfaces';
import { SchemaColumnCreateUpdateDto } from '@d19n/models/dist/schema-manager/schema/column/dto/schema.column.create.update.dto';
import { SchemaColumnEntity } from '@d19n/models/dist/schema-manager/schema/column/schema.column.entity';
import { SchemaColumnTypes } from '@d19n/models/dist/schema-manager/schema/column/types/schema.column.types';
import { SchemaColumnValidatorEnums } from '@d19n/models/dist/schema-manager/schema/column/validator/schema.column.validator.types';
import { SchemaCreateUpdateDto } from '@d19n/models/dist/schema-manager/schema/dto/schema.create.update.dto';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SchemaTypeCreateDto } from '@d19n/models/dist/schema-manager/schema/types/dto/schema.type.create.dto';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { SchemaTypeEntity } from '@d19n/models/dist/schema-manager/schema/types/schema.type.entity';
import { forwardRef } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { pascalCase } from 'change-case';
import { v4 as uuidv4 } from 'uuid';
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
  let recordOne: IDbRecordCreateUpdateRes[];
  let recordTwo: IDbRecordCreateUpdateRes[];
  let recordThree: IDbRecordCreateUpdateRes[];

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


  test('should create a schema with schema types and 2 columns', async (done) => {

    const schemaCreateUpdate = new SchemaCreateUpdateDto();
    schemaCreateUpdate.name = 'feature test';
    schemaCreateUpdate.moduleName = SchemaModuleTypeEnums.PROJECT_MODULE;
    schemaCreateUpdate.entityName = pascalCase(uuidv4());

    const res = await schemasService.createSchemaByPrincipal(principal, schemaCreateUpdate, { upsert: true });

    expect(res).toBeInstanceOf(SchemaEntity);
    expect(res).toHaveProperty('id');

    schema = res;
    // create schema types

    // Create a new schema column with no type
    const createCol = new SchemaColumnCreateUpdateDto();
    createCol.name = 'TestColumn';
    createCol.type = SchemaColumnTypes.TEXT;
    createCol.label = 'test label';
    createCol.position = 0;
    createCol.description = 'test description';
    createCol.isStatic = false;
    createCol.isHidden = false;
    createCol.isTitleColumn = false;
    createCol.isVisibleInTables = false;

    const col = await schemasColumnsService.createByPrincipal(principal, schema.id, createCol);

    expect(col).toBeInstanceOf(SchemaColumnEntity);
    expect(col).toHaveProperty('id');
    expect(col.schemaTypeId).toBe(null);

    const newType1 = new SchemaTypeCreateDto();
    newType1.name = 'TYPE_1';
    newType1.label = 'type 1';
    newType1.description = 'type 1 description';
    newType1.isDefault = true;

    const type1 = await schemasTypesService.createByPrincipal(principal, schema.id, newType1);

    expect(type1).toBeInstanceOf(SchemaTypeEntity);
    expect(type1).toHaveProperty('id');
    expect(type1.schemaId).toBe(res.id);
    expect(type1.name).toBe(newType1.name);
    expect(type1.isDefault).toBe(newType1.isDefault);

    schemaType1 = type1;

    // Create a new schema column for TYPE_1
    const createCol1 = new SchemaColumnCreateUpdateDto();
    createCol1.schemaTypeId = type1.id;
    createCol1.name = 'TestColumn1';
    createCol1.type = SchemaColumnTypes.TEXT;
    createCol1.label = 'test 1 label';
    createCol1.position = 0;
    createCol1.description = 'test 1 description';
    createCol1.isStatic = false;
    createCol1.isHidden = false;
    createCol1.isTitleColumn = false;
    createCol1.isVisibleInTables = false;

    const col1 = await schemasColumnsService.createByPrincipal(principal, schema.id, createCol1);

    expect(col1).toBeInstanceOf(SchemaColumnEntity);
    expect(col1).toHaveProperty('id');
    expect(col1.schemaTypeId).toBe(type1.id);


    // create second type and column type
    const newType2 = new SchemaTypeCreateDto();
    newType2.name = 'TYPE_2';
    newType2.label = 'type 2';
    newType2.description = 'type 2 description';
    newType2.isDefault = false;

    const type2 = await schemasTypesService.createByPrincipal(principal, res.id, newType2);

    expect(type2).toBeInstanceOf(SchemaTypeEntity);
    expect(type2).toHaveProperty('id');
    expect(type2.schemaId).toBe(res.id);
    expect(type2.name).toBe(newType2.name);
    expect(type2.isDefault).toBe(newType2.isDefault);

    schemaType2 = type2;

    // Create a new schema column for TYPE_2
    const createCol2 = new SchemaColumnCreateUpdateDto();
    createCol2.schemaTypeId = type2.id;
    createCol2.name = 'TestColumn2';
    createCol2.type = SchemaColumnTypes.TEXT;
    createCol2.label = 'test 2 label';
    createCol2.position = 0;
    createCol2.description = 'test 2 description';
    createCol2.isStatic = false;
    createCol2.isHidden = false;
    createCol2.isTitleColumn = false;
    createCol2.isVisibleInTables = false;

    const col2 = await schemasColumnsService.createByPrincipal(principal, schema.id, createCol2);

    expect(col2).toBeInstanceOf(SchemaColumnEntity);
    expect(col2).toHaveProperty('id');
    expect(col2.schemaTypeId).toBe(type2.id);

    done();

  });

  test('should create record for property TYPE_1', async (done) => {

    const create = new DbRecordCreateUpdateDto();
    create.entity = `${schema.moduleName}:${schema.entityName}`;
    create.type = schemaType1.name;
    create.properties = {
      TestColumn1: 'testing value 1',
    };

    const res = await dbService.updateOrCreateDbRecordsByPrincipal(
      principal,
      [ create ],
      { upsert: true },
    );

    expect(res).toHaveLength(1);

    recordOne = res;

    done();
  });

  test('should get record for property TYPE_1', async (done) => {

    const res = await dbService.getDbRecordTransformedByOrganizationAndId(
      principal.organization,
      recordOne[0].id,
      [],
    );

    expect(res.properties).toHaveProperty('TestColumn1');
    expect(res.properties).not.toHaveProperty('TestColumn2');

    done();
  });

  test('should create record for property TYPE_2', async (done) => {

    const create = new DbRecordCreateUpdateDto();
    create.entity = `${schema.moduleName}:${schema.entityName}`;
    create.type = schemaType2.name;
    create.properties = {
      TestColumn2: 'testing value 2',
      TestColumn: 'test col',
    };

    const res = await dbService.updateOrCreateDbRecordsByPrincipal(
      principal,
      [ create ],
      { upsert: true },
    );

    expect(res).toHaveLength(1);

    recordTwo = res;

    done();

  });

  test('should upsert a record with unique properties and schema type ', async (done) => {

    // Create a new schema column for TYPE_2
    const createCol3 = new SchemaColumnCreateUpdateDto();
    createCol3.schemaTypeId = schemaType2.id;
    createCol3.name = 'TestColumnUnique';
    createCol3.type = SchemaColumnTypes.TEXT;
    createCol3.label = 'test 2 unique';
    createCol3.position = 0;
    createCol3.description = 'test 2 unqieu column';
    createCol3.isStatic = false;
    createCol3.isHidden = false;
    createCol3.isTitleColumn = false;
    createCol3.isVisibleInTables = false;
    createCol3.validators = [
      SchemaColumnValidatorEnums.REQUIRED,
      SchemaColumnValidatorEnums.UNIQUE,
    ];

    const col3 = await schemasColumnsService.createByPrincipal(principal, schema.id, createCol3);

    expect(col3).toBeInstanceOf(SchemaColumnEntity);
    expect(col3).toHaveProperty('id');
    expect(col3.schemaTypeId).toBe(schemaType2.id);

    const create = new DbRecordCreateUpdateDto();
    create.entity = `${schema.moduleName}:${schema.entityName}`;
    create.type = schemaType2.name;
    create.properties = {
      TestColumn2: 'testing value 2',
      TestColumn: 'test col',
      TestColumnUnique: 'UNIQUE_VALUE',
    };

    const res = await dbService.updateOrCreateDbRecordsByPrincipal(
      principal,
      [ create ],
      { upsert: true },
    );

    expect(res).toHaveLength(1);

    const res2 = await dbService.updateOrCreateDbRecordsByPrincipal(
      principal,
      [ create ],
      { upsert: true },
    );

    expect(res).toHaveLength(1);
    expect(res[0].id).toBe(res2[0].id);

    recordThree = res;

    done();

  });


  test('should get record for property TYPE_2', async (done) => {

    const res = await dbService.getDbRecordTransformedByOrganizationAndId(
      principal.organization,
      recordTwo[0].id,
      [],
    );

    expect(res.properties).toHaveProperty('TestColumn2');
    expect(res.properties).toHaveProperty('TestColumn');
    expect(res.properties).not.toHaveProperty('TestColumn1');

    done();
  });


  afterAll(async () => {
    await app.close();
  });
});
