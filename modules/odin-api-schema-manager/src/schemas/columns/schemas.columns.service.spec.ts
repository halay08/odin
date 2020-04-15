import { APIClient } from '@d19n/client/dist/common/APIClient';
import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { SchemaColumnCreateUpdateDto } from '@d19n/models/dist/schema-manager/schema/column/dto/schema.column.create.update.dto';
import { SchemaColumnEntity } from '@d19n/models/dist/schema-manager/schema/column/schema.column.entity';
import { SchemaColumnTypes } from '@d19n/models/dist/schema-manager/schema/column/types/schema.column.types';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { forwardRef } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbCacheModule } from '../../cache/db.cache.module';
import { AuthUserHelper } from '../../helpers/AuthUserHelper';
import { TestModuleConfig } from '../../helpers/tests/TestModuleConfig';
import { LogsUserActivityModule } from '../../logs/user-activity/logs.user.activity.module';
import { SchemasAssociationsRepository } from '../associations/schemas.associations.repository';
import { SchemasAssociationsService } from '../associations/schemas.associations.service';
import { SchemasRabbitmqServiceRpc } from '../schemas.rabbitmq.service.rpc';
import { SchemasRepository } from '../schemas.repository';
import { SchemasService } from '../schemas.service';
import { SchemasTypesRepository } from '../types/schemas.types.repository';
import { SchemasTypesService } from '../types/schemas.types.service';
import { SchemasColumnsOptionsRepository } from './options/schemas.columns.options.repository';
import { SchemasColumnsOptionsService } from './options/schemas.columns.options.service';
import { SchemasColumnsRabbitmqServiceRpc } from './schemas.columns.rabbitmq.service.rpc';
import { SchemasColumnsRepository } from './schemas.columns.repository';
import { SchemasColumnsService } from './schemas.columns.service';
import { SchemasColumnsValidatorsRepository } from './validators/schemas.columns.validators.repository';
import { SchemasColumnsValidatorsService } from './validators/schemas.columns.validators.service';

jest.setTimeout(30000);

describe('SchemasColumnsService', () => {
  let schemasColumnsService: SchemasColumnsService;
  let principal: OrganizationUserEntity;
  let schemaColumn: SchemaColumnEntity;
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

    // Get a schema
    schema = await APIClient.call<SchemaEntity>({
      facility: 'http',
      baseUrl: Utilities.getBaseUrl(SERVICE_NAME.SCHEMA_MODULE),
      service: 'v1.0/schemas/bymodule?moduleName=CrmModule&entityName=Contact',
      method: 'get',
      headers: { Authorization: login.headers.authorization },
      debug: false,
    });

    schemasColumnsService = app.get<SchemasColumnsService>(SchemasColumnsService);
  });


  describe('Schema columns get methods', () => {

  });


  describe('Schema columns CRUD', () => {


    it('should create a single schema column of type TEXT', async (done) => {

      const schemaColumnCreateUpdate = new SchemaColumnCreateUpdateDto();
      schemaColumnCreateUpdate.name = Math.random().toString(36).substring(7);
      schemaColumnCreateUpdate.type = SchemaColumnTypes.TEXT;
      schemaColumnCreateUpdate.label = 'example label';
      schemaColumnCreateUpdate.position = 0;
      schemaColumnCreateUpdate.columnPosition = 1;
      schemaColumnCreateUpdate.description = 'example description';
      schemaColumnCreateUpdate.isStatic = false;
      schemaColumnCreateUpdate.isHidden = false;
      schemaColumnCreateUpdate.isTitleColumn = false;
      schemaColumnCreateUpdate.isVisibleInTables = false;

      const res = await schemasColumnsService.createByPrincipal(principal, schema.id, schemaColumnCreateUpdate);

      expect(res).toBeInstanceOf(SchemaColumnEntity);
      expect(res).toHaveProperty('position');
      expect(res).toHaveProperty('columnPosition');

      expect(res.position).toBe(0);
      expect(res.columnPosition).toBe(1);

      schemaColumn = res;
      done();

    });

    it('should delete a schema column by id', async (done) => {
      const res = await schemasColumnsService.deleteByPrincipalAndSchemaAndId(principal, schema.id, schemaColumn.id);
      expect(res.affected).toBe(1);
      done();
    })

    it('should create a single schema column of type ENUM', async (done) => {
      const schemaColumnCreateUpdate = new SchemaColumnCreateUpdateDto();
      schemaColumnCreateUpdate.name = Math.random().toString(36).substring(7);
      schemaColumnCreateUpdate.type = SchemaColumnTypes.ENUM;
      schemaColumnCreateUpdate.label = 'example label';
      schemaColumnCreateUpdate.position = 0;
      schemaColumnCreateUpdate.columnPosition = 2;
      schemaColumnCreateUpdate.description = 'example description';
      schemaColumnCreateUpdate.options = [
        { label: 'Test', value: 'TEST', position: 0 },
        { label: 'Test 4', value: 'TEST_4', position: 0 },
      ];
      schemaColumnCreateUpdate.validators = [];
      schemaColumnCreateUpdate.isStatic = false;
      schemaColumnCreateUpdate.isHidden = false;
      schemaColumnCreateUpdate.isTitleColumn = false;
      schemaColumnCreateUpdate.isVisibleInTables = false;


      const res = await schemasColumnsService.createByPrincipal(principal, schema.id, schemaColumnCreateUpdate);

      expect(res).toBeInstanceOf(SchemaColumnEntity);
      expect(res).toHaveProperty('id');

      expect(res.position).toBe(0);
      expect(res.columnPosition).toBe(2);

      expect(res.options).toHaveLength(2);
      expect(res.validators).toHaveLength(0);

      schemaColumn = res;

      done();
    });


    it('should update a single schema column of type ENUM', async (done) => {
      const schemaColumnCreateUpdate = new SchemaColumnCreateUpdateDto();
      schemaColumnCreateUpdate.type = SchemaColumnTypes.ENUM;
      schemaColumnCreateUpdate.options = [
        { label: 'Test 1', value: 'TEST_1', position: 1 },
        { label: 'Test 2', value: 'TEST_2', position: 2 },
        { label: 'Test 3', value: 'TEST_3', position: 3 },
        { label: 'Test 4 rev 1', value: 'TEST_4', position: 0 },
      ];
      schemaColumnCreateUpdate.validators = [ 'REQUIRED' ];

      const res = await schemasColumnsService.updateByPrincipalAndSchemaIdAndId(
        principal,
        schema.id,
        schemaColumn.id,
        schemaColumnCreateUpdate,
      );

      expect(res).toBeInstanceOf(SchemaColumnEntity);
      expect(res).toHaveProperty('id');
      expect(res.options).toHaveLength(4);
      expect(res.validators).toHaveLength(1);

      schemaColumn = res;

      done();
    });

    it('should update a single schema column is hidden', async (done) => {
      const schemaColumnCreateUpdate = new SchemaColumnCreateUpdateDto();
      schemaColumnCreateUpdate.type = SchemaColumnTypes.ENUM;
      schemaColumnCreateUpdate.isHidden = false;
      schemaColumnCreateUpdate.validators = [ 'REQUIRED' ];

      const res = await schemasColumnsService.updateByPrincipalAndSchemaIdAndId(
        principal,
        schema.id,
        schemaColumn.id,
        schemaColumnCreateUpdate,
      );

      expect(res).toBeInstanceOf(SchemaColumnEntity);
      expect(res).toHaveProperty('id');
      expect(res).toHaveProperty('isHidden');
      expect(res.options).toHaveLength(4);
      expect(res.validators).toHaveLength(1);

      schemaColumn = res;
      done();
    });

    it('should delete options and validators when passing an empty array', async (done) => {
      const schemaColumnCreateUpdate = new SchemaColumnCreateUpdateDto();
      schemaColumnCreateUpdate.type = SchemaColumnTypes.ENUM;
      schemaColumnCreateUpdate.options = [];
      schemaColumnCreateUpdate.validators = [];

      const res = await schemasColumnsService.updateByPrincipalAndSchemaIdAndId(
        principal,
        schema.id,
        schemaColumn.id,
        schemaColumnCreateUpdate,
      );

      expect(res).toBeInstanceOf(SchemaColumnEntity);
      expect(res).toHaveProperty('id');
      expect(res.options).toHaveLength(0);
      expect(res.validators).toHaveLength(0);

      schemaColumn = res;
      done();
    });

    it('should delete a schema column by id', async (done) => {
      const res = await schemasColumnsService.deleteByPrincipalAndSchemaAndId(principal, schema.id, schemaColumn.id);
      expect(res.affected).toBe(1);
      done();
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
