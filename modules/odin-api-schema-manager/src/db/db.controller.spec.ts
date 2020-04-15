import { APIClient } from '@d19n/client/dist/common/APIClient';
import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbRecordEntity } from '@d19n/models/dist/schema-manager/db/record/db.record.entity';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { IDbRecordCreateUpdateRes } from '@d19n/models/dist/schema-manager/db/record/interfaces/interfaces';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { Test, TestingModule } from '@nestjs/testing';
import faker from 'faker';
import { v4 as uuidv4 } from 'uuid';
import { AuthUserHelper } from '../helpers/AuthUserHelper';
import { DbController } from './db.controller';
import { DbService } from './db.service';
import { DbRecordDeleted } from './types/db.record.deleted';


describe('DbController', () => {
  let dbController: DbController;
  let dbService: DbService;
  let principal: OrganizationUserEntity;

  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [ DbController ],
      providers: [
        {
          provide: DbService,
          useValue: {
            searchDbRecordsByPrincipal: jest.fn(),
            updateOrCreateDbRecordsByPrincipal: jest.fn(),
            updateDbRecordsByPrincipalAndId: jest.fn(),
            getDbRecordsByOrganizationAndId: jest.fn(),
            getDbRecordsTransformedByOrganizationAndId: jest.fn(),
            deleteByPrincipalAndId: jest.fn(),
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

    dbService = app.get<DbService>(DbService);
    dbController = app.get<DbController>(DbController);
   
  });


  describe('updateOrCreateByPrincipal', () => {
    it('should create a single DbRecord', async (done) => {

      const dbRecordCreateUpdate = new DbRecordCreateUpdateDto();
      dbRecordCreateUpdate.entity = `${SchemaModuleTypeEnums.CRM_MODULE}:${SchemaModuleEntityTypeEnums.LEAD}`;
      dbRecordCreateUpdate.properties = {
        Name: faker.address.streetAddress(),
        Type: 'RESIDENTIAL',
        Source: 'WEBSITE',
        EmailAddress: faker.internet.email(),
      };

      expect(
        await dbController.updateOrCreateDbRecordsByPrincipal(
          principal,
          SchemaModuleEntityTypeEnums.LEAD,
          { upsert: true },
          [ dbRecordCreateUpdate ],
        ),
      ).toEqual(
        expect.arrayContaining<DbRecordEntity>([]),
      );


      done();
    });
  });

  describe('updateByPrincipalAndId', () => {
    it('should update a single DbRecord by Id', async (done) => {

      const dbRecordCreateUpdate = new DbRecordCreateUpdateDto();
      dbRecordCreateUpdate.entity = `${SchemaModuleTypeEnums.CRM_MODULE}:${SchemaModuleEntityTypeEnums.LEAD}`;
      dbRecordCreateUpdate.properties = {
        Name: 'Test Lead rev 1',
      };

      expect(
        await dbController.updateDbRecordsByPrincipalAndId(
          principal,
          SchemaModuleEntityTypeEnums.LEAD,
          uuidv4(),
          dbRecordCreateUpdate,
        ),
      ).toEqual(
        expect.arrayContaining<IDbRecordCreateUpdateRes>([]),
      );

      done();
    });
  });

  describe('deleteByPrincipalAndId', () => {
    it('should delete a single DbRecord by Id', async (done) => {

      const result = new DbRecordDeleted();
      jest.spyOn(dbService, 'deleteByPrincipalAndId').mockImplementation(() => Promise.resolve([ result ]));
      const res = await dbController.deleteByPrincipalAndId(principal, SchemaModuleEntityTypeEnums.LEAD, uuidv4());
      console.log('res', res);

      expect(
        await dbController.deleteByPrincipalAndId(principal, SchemaModuleEntityTypeEnums.LEAD, uuidv4())).toEqual(
        expect.arrayContaining<DbRecordDeleted>([]));
      done();
    });
  });


  afterAll(async () => {
    await app.close();
  });
});
