import { APIClient } from '@d19n/client/dist/common/APIClient';
import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { SchemaCreateUpdateDto } from '@d19n/models/dist/schema-manager/schema/dto/schema.create.update.dto';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SchemaTypeCreateDto } from '@d19n/models/dist/schema-manager/schema/types/dto/schema.type.create.dto';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { SchemaTypeEntity } from '@d19n/models/dist/schema-manager/schema/types/schema.type.entity';
import { forwardRef } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { pascalCase } from 'change-case';
import faker from 'faker';
import { DbCacheModule } from '../../cache/db.cache.module';
import { AuthUserHelper } from '../../helpers/AuthUserHelper';
import { TestModuleConfig } from '../../helpers/tests/TestModuleConfig';
import { LogsUserActivityModule } from '../../logs/user-activity/logs.user.activity.module';
import { SchemasAssociationsRepository } from '../associations/schemas.associations.repository';
import { SchemasAssociationsService } from '../associations/schemas.associations.service';
import { SchemasColumnsOptionsRepository } from '../columns/options/schemas.columns.options.repository';
import { SchemasColumnsOptionsService } from '../columns/options/schemas.columns.options.service';
import { SchemasColumnsRabbitmqServiceRpc } from '../columns/schemas.columns.rabbitmq.service.rpc';
import { SchemasColumnsRepository } from '../columns/schemas.columns.repository';
import { SchemasColumnsService } from '../columns/schemas.columns.service';
import { SchemasColumnsValidatorsRepository } from '../columns/validators/schemas.columns.validators.repository';
import { SchemasColumnsValidatorsService } from '../columns/validators/schemas.columns.validators.service';
import { SchemasRabbitmqServiceRpc } from '../schemas.rabbitmq.service.rpc';
import { SchemasRepository } from '../schemas.repository';
import { SchemasService } from '../schemas.service';
import { SchemasTypesRepository } from './schemas.types.repository';
import { SchemasTypesService } from './schemas.types.service';

jest.setTimeout(30000);

describe('SchemasTypesService', () => {

  let schemasService: SchemasService
  let schemasTypesService: SchemasTypesService;

  let principal: OrganizationUserEntity;
  let schemaType1: SchemaTypeEntity;
  let schemaType2: SchemaTypeEntity;
  let schema: SchemaEntity;

  let app: TestingModule;

  beforeAll(async () => {

    app = await new TestModuleConfig([
      forwardRef(() => LogsUserActivityModule),
      DbCacheModule,
      TypeOrmModule.forFeature([
        SchemasRepository,
        SchemasTypesRepository,
        SchemasAssociationsRepository,
        SchemasColumnsRepository,
        SchemasColumnsOptionsRepository,
        SchemasColumnsValidatorsRepository,
      ]),
    ], [
      SchemasService,
      SchemasTypesService,
      SchemasRabbitmqServiceRpc,
      SchemasAssociationsService,
      SchemasColumnsService,
      SchemasColumnsOptionsService,
      SchemasColumnsValidatorsService,
      SchemasColumnsRabbitmqServiceRpc,
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

    schemasTypesService = app.get<SchemasTypesService>(SchemasTypesService);
    schemasService = app.get<SchemasService>(SchemasService);

  });

  test('should create a single schema', async (done) => {

    const schemaCreateUpdate = new SchemaCreateUpdateDto();
    schemaCreateUpdate.name = faker.hacker.noun() + '- ' + faker.random.number();
    schemaCreateUpdate.moduleName = SchemaModuleTypeEnums.PROJECT_MODULE;
    schemaCreateUpdate.entityName = pascalCase(faker.hacker.noun() + '' + faker.random.number());
    schemaCreateUpdate.isSequential = true;
    schemaCreateUpdate.recordNumber = 0;
    schemaCreateUpdate.recordNumberPrefix = 'XX-';

    const res = await schemasService.createSchemaByPrincipal(principal, schemaCreateUpdate, { upsert: true });

    expect(res).toBeInstanceOf(SchemaEntity);
    expect(res).toHaveProperty('id');

    schema = res;
    done();

  });

  test('should create a single schema type', async (done) => {

    const newType = new SchemaTypeCreateDto();
    newType.name = 'TYPE_1';
    newType.label = 'type 1';
    newType.description = 'type 1 description';
    newType.isDefault = false;


    const res = await schemasTypesService.createByPrincipal(principal, schema.id, newType);

    expect(res).toBeInstanceOf(SchemaTypeEntity);
    expect(res).toHaveProperty('id');
    expect(res.schemaId).toBe(schema.id);
    expect(res.name).toBe(newType.name);
    expect(res.isDefault).toBe(newType.isDefault);

    schemaType1 = res;

    done();

  });

  test('should return a 409 conflict creating a duplicate schema type', async (done) => {

    const newType = new SchemaTypeCreateDto();
    newType.name = 'TYPE_1';
    newType.label = 'type 1';
    newType.description = 'type 1 description';
    newType.isDefault = false;

    try {
      await schemasTypesService.createByPrincipal(principal, schema.id, newType);
    } catch (e) {
      expect(e.statusCode).toBe(409);
    }

    done();

  });

  test('schema should have 1 schema type', async (done) => {

    const res = await schemasService.getSchemaByOrganizationAndId(principal.organization, { schemaId: schema.id });

    expect(res.types).toHaveLength(1);

    done();

  });


  test('should create a second schema type', async (done) => {

    const newType = new SchemaTypeCreateDto();
    newType.label = 'type 2';
    newType.description = 'type 2 description';
    newType.name = 'TYPE_2';
    newType.isDefault = false;

    const res = await schemasTypesService.createByPrincipal(principal, schema.id, newType);

    expect(res).toBeInstanceOf(SchemaTypeEntity);
    expect(res).toHaveProperty('id');

    schemaType2 = res;

    done();

  });


  test('should delete both schema types', async (done) => {

    const res1 = await schemasTypesService.deleteByPrincipalAndId(principal, schema.id, schemaType1.id);
    const res2 = await schemasTypesService.deleteByPrincipalAndId(principal, schema.id, schemaType2.id);

    expect(res1.affected).toBe(1);
    expect(res2.affected).toBe(1);

    done();

  });


  afterAll(async () => {
    await app.close();
  });

});
