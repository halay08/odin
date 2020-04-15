import { v4 as uuidv4 } from 'uuid';
import { Test, TestingModule } from "@nestjs/testing";
import { OrganizationUserEntity } from "@d19n/models/dist/identity/organization/user/organization.user.entity";
import { APIClient } from "@d19n/client/dist/common/APIClient";
import { Utilities } from "@d19n/client/dist/helpers/Utilities";
import { SERVICE_NAME } from "@d19n/client/dist/helpers/Services";
import { SchemasColumnsController } from "./schemas.columns.controller";
import { SchemasColumnsService } from "./schemas.columns.service";
import { AuthUserHelper } from "../../helpers/AuthUserHelper";
import { SchemaColumnEntity } from "@d19n/models/dist/schema-manager/schema/column/schema.column.entity";
import { SchemaColumnCreateUpdateDto } from "@d19n/models/dist/schema-manager/schema/column/dto/schema.column.create.update.dto";


describe('SchemasColumnsController', () => {
  let schemasColumnsController: SchemasColumnsController;
  let schemasColumnsService: SchemasColumnsService;
  let principal: OrganizationUserEntity;

  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [ SchemasColumnsController ],
      providers: [
        {
          provide: SchemasColumnsService,
          useValue: {
            createByPrincipal: jest.fn(),
            updateByPrincipalAndSchemaIdAndId: jest.fn(),
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

    schemasColumnsService = app.get<SchemasColumnsService>(SchemasColumnsService);
    schemasColumnsController = app.get<SchemasColumnsController>(SchemasColumnsController)
  });


  describe('createByPrincipal', () => {
    it('should create a single schema', async (done) => {

      const schemaCreateUpdate = new SchemaColumnCreateUpdateDto();
      schemaCreateUpdate.name = 'test rev 1';

      const result = new SchemaColumnEntity();
      jest.spyOn(schemasColumnsService, 'createByPrincipal').mockImplementation(() => Promise.resolve(result));
      expect(await schemasColumnsController.createByPrincipalAndSchema(principal, uuidv4(), schemaCreateUpdate)).toBe(
        result);
      done();
    });
  });

  describe('updateByPrincipalAndId', () => {
    it('should update a single schema by Id', async (done) => {

      const schemaColumnCreateUpdate = new SchemaColumnCreateUpdateDto();
      schemaColumnCreateUpdate.name = 'testing update';

      const result = new SchemaColumnEntity();
      jest.spyOn(schemasColumnsService, 'updateByPrincipalAndSchemaIdAndId').mockImplementation(() => Promise.resolve(
        result));
      expect(await schemasColumnsController.updateByPrincipalAndSchemaIdAndId(
        principal,
        uuidv4(),
        uuidv4(),
        schemaColumnCreateUpdate,
      )).toBe(result);
      done();
    });
  });


  afterAll(async () => {
    await app.close();
  });
});
