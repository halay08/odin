import { v4 as uuidv4 } from 'uuid';
import { SchemasController } from "./schemas.controller";
import { SchemasService } from "./schemas.service";
import { Test, TestingModule } from "@nestjs/testing";
import { OrganizationUserEntity } from "@d19n/models/dist/identity/organization/user/organization.user.entity";
import { AuthUserHelper } from "../helpers/AuthUserHelper";
import { SchemaEntity } from "@d19n/models/dist/schema-manager/schema/schema.entity";
import { APIClient } from "@d19n/client/dist/common/APIClient";
import { Utilities } from "@d19n/client/dist/helpers/Utilities";
import { SERVICE_NAME } from "@d19n/client/dist/helpers/Services";
import { SchemaCreateUpdateDto } from "@d19n/models/dist/schema-manager/schema/dto/schema.create.update.dto";
import { SchemaModuleTypeEnums } from "@d19n/models/dist/schema-manager/schema/types/schema.module.types";
import { SchemaModuleEntityTypeEnums } from "@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types";


describe('SchemasController', () => {
  let schemasController: SchemasController;
  let schemasService: SchemasService;
  let principal: OrganizationUserEntity;

  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [ SchemasController ],
      providers: [
        {
          provide: SchemasService,
          useValue: {
            listSchemasByOrganization: jest.fn(),
            generateNewRecordNumberFromSchema: jest.fn(),
            getSchemaByOrganizationAndModuleAndEntity: jest.fn(),
            getSchemasByOrganizationAndModule: jest.fn(),
            getSchemaByOrganizationAndIdWithAssociations: jest.fn(),
            getSchemaByOrganizationAndIdWithAssociationsTransformed: jest.fn(),
            getSchemaByOrganizationAndId: jest.fn(),
            getSchemaByOrganizationAndEntity: jest.fn(),
            getSchemaByOrganizationAndEntityOrId: jest.fn(),
            createSchemaByPrincipal: jest.fn(),
            updateSchemaByPrincipalAndId: jest.fn(),
            deleteSchemaByPrincipalAndId: jest.fn(),
          },
        },
      ],
    }).compile();

    const login = await AuthUserHelper.login();
    const res = await APIClient.call<OrganizationUserEntity>({
      facility: 'http',
      baseUrl: Utilities.getBaseUrl(SERVICE_NAME.IDENTITY_MODULE),
      service: 'v1.0/users/my',
      method: 'get',
      headers: { Authorization: login.headers.authorization },
      debug: false,
    });
    principal = res;

    schemasService = app.get<SchemasService>(SchemasService);
    schemasController = app.get<SchemasController>(SchemasController)
  });


  describe('createByPrincipal', () => {
    it('should create a single schema', async (done) => {

      const schemaCreateUpdate = new SchemaCreateUpdateDto();
      schemaCreateUpdate.name = 'testing';
      schemaCreateUpdate.moduleName = SchemaModuleTypeEnums.ORDER_MODULE;
      schemaCreateUpdate.entityName = SchemaModuleEntityTypeEnums.ORDER;

      const result = new SchemaEntity();
      jest.spyOn(schemasService, 'createSchemaByPrincipal').mockImplementation(() => Promise.resolve(result));
      expect(await schemasController.createByPrincipal(principal, schemaCreateUpdate, { upsert: true })).toBe(result);
      done();
    });
  });

  describe('updateByPrincipalAndId', () => {
    it('should update a single schema by Id', async (done) => {

      const schemaCreateUpdate = new SchemaCreateUpdateDto();
      schemaCreateUpdate.name = 'testing update';

      const result = new SchemaEntity();
      jest.spyOn(schemasService, 'updateSchemaByPrincipalAndId').mockImplementation(() => Promise.resolve(result));
      expect(await schemasController.updateByPrincipalAndId(principal, uuidv4(), schemaCreateUpdate)).toBe(result);
      done();
    });
  });


  afterAll(async () => {
    await app.close();
  });
});
