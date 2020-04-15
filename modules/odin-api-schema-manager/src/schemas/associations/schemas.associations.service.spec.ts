import { APIClient } from '@d19n/client/dist/common/APIClient';
import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbRecordAssociationConstants } from '@d19n/models/dist/schema-manager/db/record/association/types/db.record.association.constants';
import { SchemaAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/schema/association/dto/schema.association.create.update.dto';
import { SchemaAssociationEntity } from '@d19n/models/dist/schema-manager/schema/association/schema.association.entity';
import { SchemaAssociationCardinalityTypes } from '@d19n/models/dist/schema-manager/schema/association/types/schema.association.cardinality.types';
import { SchemaCreateUpdateDto } from '@d19n/models/dist/schema-manager/schema/dto/schema.create.update.dto';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { forwardRef } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import faker from 'faker';
import { DbCacheModule } from '../../cache/db.cache.module';
import { AuthUserHelper } from '../../helpers/AuthUserHelper';
import { TestModuleConfig } from '../../helpers/tests/TestModuleConfig';
import { LogsUserActivityModule } from '../../logs/user-activity/logs.user.activity.module';
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
import { SchemasTypesRepository } from '../types/schemas.types.repository';
import { SchemasTypesService } from '../types/schemas.types.service';
import { SchemasAssociationsRepository } from './schemas.associations.repository';
import { SchemasAssociationsService } from './schemas.associations.service';

jest.setTimeout(30000);

describe('SchemasAssociationsService', () => {
  let schemasAssociationsService: SchemasAssociationsService;
  let schemasService: SchemasService;
  let principal: OrganizationUserEntity;
  let schemaAssociation: SchemaAssociationEntity;
  let schema: SchemaEntity;
  let schemaOne: SchemaEntity;
  let schemaTwo: SchemaEntity;

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

    schemasAssociationsService = app.get<SchemasAssociationsService>(SchemasAssociationsService);
    schemasService = app.get<SchemasService>(SchemasService);
  });

  describe('methods should be defined', () => {
    it('should have public methods', (done) => {
      expect(schemasAssociationsService.getAssociationsByOrganizationAndSchemaIdAndDirection).toBeDefined();
      expect(schemasAssociationsService.createSchemaAssociationByPrincipal).toBeDefined();
      expect(schemasAssociationsService.updateSchemaAssociationByPrincipalAndId).toBeDefined();
      expect(schemasAssociationsService.deleteSchemaAssociationByPrincipalAndId).toBeDefined();
      expect(schemasAssociationsService.getSchemaAssociationByOrganizationAndId).toBeDefined();
      expect(schemasAssociationsService.getSchemaAssociationByOrganizationAndQuery).toBeDefined();
      expect(schemasAssociationsService.getParentAndChildSchemaAssociationsByOrganizationAndSchemaId).toBeDefined();
      done();
    });
  });

  describe('Schema association get methods', () => {

    it('should get schema associations', async (done) => {

      const res = await schemasService.getFullSchemaByOrganizationAndModuleAndEntity(
        principal.organization,
        'CrmModule',
        'Contact',
      );
      expect(res).toHaveProperty('id');
      expect(res.columns.length).toBeGreaterThan(1);
      expect(res.associations.length).toBeGreaterThan(1);
      schema = res;
      done();
    });

    it('should get child schema associations', async (done) => {

      const res = await schemasAssociationsService.getAssociationsByOrganizationAndSchemaIdAndDirection(
        principal.organization,
        schema.id,
        DbRecordAssociationConstants.GET_CHILD_RELATIONS,
      );

      expect(res.length).toBeGreaterThan(1);
      done();

    });

    it('should get parent schema associations', async (done) => {

      const res = await schemasAssociationsService.getAssociationsByOrganizationAndSchemaIdAndDirection(
        principal.organization,
        schema.id,
        DbRecordAssociationConstants.GET_PARENT_RELATIONS,
      );

      expect(res.length).toBeGreaterThan(1);
      done();

    });

    it('should get all child associations by schema id', async (done) => {

      const childAssociations: SchemaAssociationEntity[] = await schemasAssociationsService.getSchemaAssociationByOrganizationAndQuery(
        principal.organization,
        { parentSchemaId: schema.id },
      );

      console.log('childAssociations', childAssociations);

      expect(childAssociations.length).toBeGreaterThan(1);
      done();

    });

    it('should get all parent associations by schema id', async (done) => {

      const paretnAssociations: SchemaAssociationEntity[] = await schemasAssociationsService.getSchemaAssociationByOrganizationAndQuery(
        principal.organization,
        { childSchemaId: schema.id },
      );

      console.log('paretnAssociations', paretnAssociations);

      expect(paretnAssociations.length).toBeGreaterThan(1);
      done();

    });

  });


  describe('schema association CRUD', () => {

    it('should create schemaOne', async (done) => {
      const schemaCreateUpdate = new SchemaCreateUpdateDto();
      schemaCreateUpdate.name = Math.random().toString(36).substring(7);
      schemaCreateUpdate.moduleName = SchemaModuleTypeEnums.ORDER_MODULE;
      schemaCreateUpdate.entityName = faker.lorem.word();
      schemaCreateUpdate.isSequential = true;
      schemaCreateUpdate.recordNumber = 0;
      schemaCreateUpdate.recordNumberPrefix = 'AB-';

      const res = await schemasService.createSchemaByPrincipal(principal, schemaCreateUpdate, { upsert: true });

      expect(res).toBeInstanceOf(SchemaEntity);
      expect(res).toHaveProperty('id');
      schemaOne = res;
      done();
    });

    it('should create schemaTwo', async (done) => {
      const schemaCreateUpdate = new SchemaCreateUpdateDto();
      schemaCreateUpdate.name = Math.random().toString(36).substring(7);
      schemaCreateUpdate.moduleName = SchemaModuleTypeEnums.CRM_MODULE;
      schemaCreateUpdate.entityName = faker.lorem.word();
      schemaCreateUpdate.isSequential = true;
      schemaCreateUpdate.recordNumber = 0;
      schemaCreateUpdate.recordNumberPrefix = 'CD-';

      const res = await schemasService.createSchemaByPrincipal(principal, schemaCreateUpdate, { upsert: true });

      expect(res).toBeInstanceOf(SchemaEntity);
      expect(res).toHaveProperty('id');
      schemaTwo = res;
      done();
    });

    it('should create a single schema association', async (done) => {
      const schemaAssociationCreateUpdate = new SchemaAssociationCreateUpdateDto();
      schemaAssociationCreateUpdate.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
      schemaAssociationCreateUpdate.childSchemaId = schemaTwo.id;
      schemaAssociationCreateUpdate.hasColumnMappings = false;
      schemaAssociationCreateUpdate.parentActions = 'LOOKUP_AND_CREATE';
      schemaAssociationCreateUpdate.childActions = 'READ_ONLY';
      schemaAssociationCreateUpdate.cascadeDeleteChildRecord = false;

      const res = await schemasAssociationsService.createSchemaAssociationByPrincipal(
        principal,
        schemaOne.id,
        schemaAssociationCreateUpdate,
      );

      expect(res).toBeInstanceOf(SchemaAssociationEntity);
      expect(res).toHaveProperty('id');
      schemaAssociation = res;
      done();
    });

    it('should update a single schema association', async (done) => {
      const schemaAssociationCreateUpdate = new SchemaAssociationCreateUpdateDto();
      schemaAssociationCreateUpdate.parentActions = 'CREATE_ONLY';
      schemaAssociationCreateUpdate.childActions = 'READ_ONLY';
      schemaAssociationCreateUpdate.cascadeDeleteChildRecord = false;

      const res = await schemasAssociationsService.updateSchemaAssociationByPrincipalAndId(
        principal,
        schemaAssociation.id,
        schemaAssociationCreateUpdate,
      );

      expect(res).toBeInstanceOf(SchemaAssociationEntity);
      expect(res).toHaveProperty('id');
      schemaAssociation = res;
      done();
    });

    it('should delete a schema association by id', async (done) => {
      const res = await schemasAssociationsService.deleteSchemaAssociationByPrincipalAndId(
        principal,
        schemaAssociation.id,
      );

      expect(res.affected).toBe(1);
      done();
    });

    it('should delete schemaOne by id', async (done) => {
      const res = await schemasService.deleteSchemaByPrincipalAndId(principal, schemaOne.id);

      expect(res.affected).toBe(1);
      done();
    });

    it('should delete a schemaTwo by id', async (done) => {
      const res = await schemasService.deleteSchemaByPrincipalAndId(principal, schemaTwo.id);

      expect(res.affected).toBe(1);
      done();
    });

  });

  afterAll(async () => {
    await app.close();
  });
});
