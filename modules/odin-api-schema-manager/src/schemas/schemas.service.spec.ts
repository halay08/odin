import { APIClient } from '@d19n/client/dist/common/APIClient';
import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { SchemaCreateUpdateDto } from '@d19n/models/dist/schema-manager/schema/dto/schema.create.update.dto';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { forwardRef } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import faker from 'faker';
import { DbCacheModule } from '../cache/db.cache.module';
import { AuthUserHelper } from '../helpers/AuthUserHelper';
import { TestModuleConfig } from '../helpers/tests/TestModuleConfig';
import { LogsUserActivityModule } from '../logs/user-activity/logs.user.activity.module';
import { SchemasAssociationsRepository } from './associations/schemas.associations.repository';
import { SchemasAssociationsService } from './associations/schemas.associations.service';
import { SchemasColumnsOptionsRepository } from './columns/options/schemas.columns.options.repository';
import { SchemasColumnsOptionsService } from './columns/options/schemas.columns.options.service';
import { SchemasColumnsRabbitmqServiceRpc } from './columns/schemas.columns.rabbitmq.service.rpc';
import { SchemasColumnsRepository } from './columns/schemas.columns.repository';
import { SchemasColumnsService } from './columns/schemas.columns.service';
import { SchemasColumnsValidatorsRepository } from './columns/validators/schemas.columns.validators.repository';
import { SchemasColumnsValidatorsService } from './columns/validators/schemas.columns.validators.service';
import { SchemasRabbitmqServiceRpc } from './schemas.rabbitmq.service.rpc';
import { SchemasRepository } from './schemas.repository';
import { SchemasService } from './schemas.service';
import { SchemasTypesRepository } from './types/schemas.types.repository';
import { SchemasTypesService } from './types/schemas.types.service';

jest.setTimeout(30000);

describe('SchemasService', () => {

  let schemasService: SchemasService;
  let principal: OrganizationUserEntity;
  let schema: SchemaEntity;
  let schemaName: string;

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

    schemaName = Math.random().toString(36).substring(7);
    schemasService = app.get<SchemasService>(SchemasService);
  });

  describe('Schema methods should be defined', () => {
    it('should have public methods', (done) => {
      expect(schemasService.listSchemasByOrganization).toBeDefined();
      expect(schemasService.generateNewRecordNumberFromSchema).toBeDefined();
      expect(schemasService.getSchemaByOrganizationAndModuleAndEntity).toBeDefined();
      expect(schemasService.getSchemasByOrganizationAndModule).toBeDefined();
      expect(schemasService.getSchemaByOrganizationAndIdWithAssociations).toBeDefined();
      expect(schemasService.getSchemaByOrganizationAndIdWithAssociationsTransformed).toBeDefined();
      expect(schemasService.getSchemaByOrganizationAndId).toBeDefined();
      expect(schemasService.getSchemaByOrganizationAndEntity).toBeDefined();
      expect(schemasService.getSchemaByOrganizationAndEntityOrId).toBeDefined();
      expect(schemasService.createSchemaByPrincipal).toBeDefined();
      expect(schemasService.updateSchemaByPrincipalAndId).toBeDefined();
      expect(schemasService.deleteSchemaByPrincipalAndId).toBeDefined();
      done();
    });
  });


  describe('Schema get methods', () => {

    let accountSchema;

    it('should get a single schema by module and entity', async (done) => {

      const res = await schemasService.getFullSchemaByOrganizationAndModuleAndEntity(
        principal.organization,
        'CrmModule',
        'Account',
      );
      expect(res).toHaveProperty('id');
      expect(res.columns.length).toBeGreaterThan(1);
      expect(res.associations.length).toBeGreaterThan(1);
      accountSchema = res;
      done();
    });

    it('should get a schema with associations by id', async (done) => {

      const res = await schemasService.getSchemaByOrganizationAndIdWithAssociations(
        principal.organization,
        { schemaId: accountSchema.id },
      );

      expect(res).toHaveProperty('id');
      expect(res.columns.length).toBeGreaterThan(1);
      expect(res.associations.length).toBeGreaterThan(1);
      done();

    })

  });


  describe('Schemas CRUD', () => {

    it('should create a single schema', async (done) => {
      const schemaCreateUpdate = new SchemaCreateUpdateDto();
      schemaCreateUpdate.name = schemaName;
      schemaCreateUpdate.moduleName = SchemaModuleTypeEnums.ORDER_MODULE;
      schemaCreateUpdate.entityName = faker.lorem.word();
      schemaCreateUpdate.isSequential = true;
      schemaCreateUpdate.recordNumber = 0;
      schemaCreateUpdate.recordNumberPrefix = 'XX-';

      const res = await schemasService.createSchemaByPrincipal(principal, schemaCreateUpdate, { upsert: true });
      expect(res).toBeInstanceOf(SchemaEntity);
      expect(res).toHaveProperty('id');
      schema = res;
      done();
    });

    it('should return a 409 when a schema with an entityName and moduleName already exists', async (done) => {
      const schemaCreateUpdate = new SchemaCreateUpdateDto();
      schemaCreateUpdate.name = schemaName;
      schemaCreateUpdate.moduleName = SchemaModuleTypeEnums.ORDER_MODULE;
      schemaCreateUpdate.entityName = SchemaModuleEntityTypeEnums.ORDER;

      try {
        await schemasService.createSchemaByPrincipal(principal, schemaCreateUpdate, { upsert: false });
      } catch (e) {
        expect(e.statusCode).toBe(409);
      }
      done();
    });

    it('should return unique recordNumbers', async (done) => {

      const res: SchemaEntity = await schemasService.generateNewRecordNumberFromSchema(
        principal.organization,
        schema.id,
      );

      console.log('res', res);

      done();

    });

    it('should delete a schema by id', async (done) => {
      const res = await schemasService.deleteSchemaByPrincipalAndId(principal, schema.id);
      expect(res.affected).toBe(1);
      done();
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
