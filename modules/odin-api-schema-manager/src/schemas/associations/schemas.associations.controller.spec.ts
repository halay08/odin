import { v4 as uuidv4 } from 'uuid';
import { Test, TestingModule } from "@nestjs/testing";
import { OrganizationUserEntity } from "@d19n/models/dist/identity/organization/user/organization.user.entity";
import { APIClient } from "@d19n/client/dist/common/APIClient";
import { Utilities } from "@d19n/client/dist/helpers/Utilities";
import { SERVICE_NAME } from "@d19n/client/dist/helpers/Services";
import { AuthUserHelper } from "../../helpers/AuthUserHelper";
import { SchemasAssociationsController } from "./schemas.associations.controller";
import { SchemasAssociationsService } from "./schemas.associations.service";
import { SchemaAssociationEntity } from "@d19n/models/dist/schema-manager/schema/association/schema.association.entity";
import { SchemaAssociationCreateUpdateDto } from "@d19n/models/dist/schema-manager/schema/association/dto/schema.association.create.update.dto";


describe('SchemasColumnsController', () => {
  let schemasAssociationsController: SchemasAssociationsController;
  let schemasAssociationsService: SchemasAssociationsService;
  let principal: OrganizationUserEntity;

  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [ SchemasAssociationsController ],
      providers: [
        {
          provide: SchemasAssociationsService,
          useValue: {
            getAssociationsByOrganizationAndSchemaIdAndDirection: jest.fn(),
            createSchemaAssociationByPrincipal: jest.fn(),
            updateSchemaAssociationByPrincipalAndId: jest.fn(),
            deleteSchemaAssociationByPrincipalAndId: jest.fn(),
            getSchemaAssociationByOrganizationAndId: jest.fn(),
            getSchemaAssociationByOrganizationAndQuery: jest.fn(),
            getParentAndChildSchemaAssociationsByOrganizationAndSchemaId: jest.fn(),
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

    schemasAssociationsService = app.get<SchemasAssociationsService>(SchemasAssociationsService);
    schemasAssociationsController = app.get<SchemasAssociationsController>(SchemasAssociationsController)
  });


  describe('createByPrincipal', () => {
    it('should create a single schema', async (done) => {

      const schemaAssociationCreateUpdate = new SchemaAssociationCreateUpdateDto();
      schemaAssociationCreateUpdate.childSchemaId = uuidv4();

      const result = new SchemaAssociationEntity();
      jest.spyOn(
        schemasAssociationsService,
        'createSchemaAssociationByPrincipal',
      ).mockImplementation(() => Promise.resolve(result));
      expect(await schemasAssociationsController.createSchemaAssociationByPrincipal(
        principal,
        uuidv4(),
        schemaAssociationCreateUpdate,
      )).toBe(result);
      done();
    });
  });

  describe('updateByPrincipalAndId', () => {
    it('should update a single schema by Id', async (done) => {

      const schemaColumnCreateUpdate = new SchemaAssociationCreateUpdateDto();
      schemaColumnCreateUpdate.childSchemaId = uuidv4();

      const result = new SchemaAssociationEntity();
      jest.spyOn(
        schemasAssociationsService,
        'updateSchemaAssociationByPrincipalAndId',
      ).mockImplementation(() => Promise.resolve(
        result));
      expect(await schemasAssociationsController.updateSchemaAssociationByPrincipalAndId(
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
