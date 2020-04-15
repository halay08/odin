import { APIClient } from '@d19n/client/dist/common/APIClient';
import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbRecordAssociationEntity } from '@d19n/models/dist/schema-manager/db/record/association/db.record.association.entity';
import { DbRecordAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/association/dto/db.record.association.create.update.dto';
import { RelationTypeEnum } from '@d19n/models/dist/schema-manager/db/record/association/types/db.record.association.constants';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { getFirstRelation, getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/schema/association/dto/schema.association.create.update.dto';
import { SchemaAssociationEntity } from '@d19n/models/dist/schema-manager/schema/association/schema.association.entity';
import { SchemaAssociationCardinalityTypes } from '@d19n/models/dist/schema-manager/schema/association/types/schema.association.cardinality.types';
import { SchemaCreateUpdateDto } from '@d19n/models/dist/schema-manager/schema/dto/schema.create.update.dto';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { forwardRef } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import { AwsS3Module } from '../../../files/awsS3/awsS3.module';
import { AuthUserHelper } from '../../../helpers/AuthUserHelper';
import { TestModuleConfig } from '../../../helpers/tests/TestModuleConfig';
import { LogsUserActivityModule } from '../../../logs/user-activity/logs.user.activity.module';
import { PipelineEntitysStagesModule } from '../../../pipelines/stages/pipelines.stages.module';
import { SchemasAssociationsService } from '../../../schemas/associations/schemas.associations.service';
import { SchemasModule } from '../../../schemas/schemas.module';
import { SchemasService } from '../../../schemas/schemas.service';
import { DbService } from '../../db.service';
import { DbServiceRabbitmqHandler } from '../../db.service.rabbitmq.handler';
import { DbServiceRabbitmqRpc } from '../../db.service.rabbitmq.rpc';
import { DbSearchModule } from '../../search/db.search.module';
import { DbRecordAssociationsColumnsRepository } from '../associations-columns/db.records.associations.columns.repository';
import { DbRecordsColumnsRepository } from '../columns/db.records.columns.repository';
import { DbRecordsRabbitmqHandler } from '../db.records.rabbitmq.handler';
import { DbRecordsRepository } from '../db.records.repository';
import { DbRecordsService } from '../db.records.service';
import { DbRecordsServiceInternal } from '../db.records.service.internal';
import { DbRecordsPrincipalServiceInternal } from '../db.records.service.internal.v2';
import { DbRecordsAssociationsRabbitmqHandler } from './db.records.associations.rabbitmq.handler';
import { DbRecordsAssociationsRepository } from './db.records.associations.repository';
import { DbRecordsAssociationsService } from './db.records.associations.service';
import { DbRecordsAssociationsServiceInternal } from './db.records.associations.service.internal';

jest.setTimeout(30000);

describe('DbRecordsAssociationsService', () => {


  let principal: OrganizationUserEntity;

  let dbService: DbService;
  let dbRecordsAssociationsService: DbRecordsAssociationsService;

  let schemasService: SchemasService;
  let schemasAssociationService: SchemasAssociationsService;

  let app: TestingModule;
  let randomSerial;

  beforeAll(async () => {

    randomSerial = uuidv4();

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

    const login = await AuthUserHelper.login();
    principal = await APIClient.call<OrganizationUserEntity>({
      facility: 'http',
      baseUrl: Utilities.getBaseUrl(SERVICE_NAME.IDENTITY_MODULE),
      service: 'v1.0/users/my',
      method: 'get',
      headers: { Authorization: login.headers.authorization },
      debug: false,
    });


    dbRecordsAssociationsService = app.get<DbRecordsAssociationsService>(DbRecordsAssociationsService);
    dbService = app.get<DbService>(DbService);
    schemasService = app.get<SchemasService>(SchemasService);
    schemasAssociationService = app.get<SchemasAssociationsService>(SchemasAssociationsService);

  });

  describe('methods should be defined', () => {
    it('should have public methods', (done) => {
      expect(dbRecordsAssociationsService.getRelatedRecordById).toBeDefined();
      expect(dbRecordsAssociationsService.createRelatedRecords).toBeDefined();
      expect(dbRecordsAssociationsService.getRelatedRecordById).toBeDefined();
      expect(dbRecordsAssociationsService.getRelatedRecordsByEntity).toBeDefined();
      expect(dbRecordsAssociationsService.getRelatedChildRecordIds).toBeDefined();
      expect(dbRecordsAssociationsService.getRelatedParentRecordIds).toBeDefined();
      expect(dbRecordsAssociationsService.lookUpRecordIdsAcrossRelations).toBeDefined();
      expect(dbRecordsAssociationsService.getRelatedRecordByParentAndChildId).toBeDefined();
      expect(dbRecordsAssociationsService.updateRelatedRecordById).toBeDefined();
      expect(dbRecordsAssociationsService.transferRelatedRecords).toBeDefined();
      expect(dbRecordsAssociationsService.deleteRelatedRecordById).toBeDefined();
      expect(dbRecordsAssociationsService.deleteManyByAssociationIds).toBeDefined();
      done();
    });
  });

  // test('it should return related recordIds', async (done) => {
  //
  //   // Test ids to test specific query
  //   const recordId = 'e8c291c7-9018-4c91-87d4-a419663286d9';
  //   const findInSchema = '4ab652cc-379a-4f5a-b721-2531129184a6';
  //   const findInChildSchema = '82b38bf4-5bb6-4687-9e26-3dcbcdcf9fdd';
  //
  //   const res = await dbRecordsAssociationsService.lookUpRecordIdsAcrossRelations(principal.organization, {
  //
  //     recordId,
  //     findInSchema,
  //     findInChildSchema,
  //
  //   })
  //
  //   console.log('res', res);
  //
  //   expect(res.length).toBe(1);
  //
  //   done();
  //
  // })

  describe('test that many_to_one relations are created', () => {

    let featureComponentAId;
    let featureComponentBId;

    let parentSchema: SchemaEntity;
    let childSchema: SchemaEntity;

    it('should create a schema and create a schema association to itself', async (done) => {

      const schemaCreateUpdate = new SchemaCreateUpdateDto();
      schemaCreateUpdate.name = 'feature test parent';
      schemaCreateUpdate.moduleName = SchemaModuleTypeEnums.PROJECT_MODULE;
      schemaCreateUpdate.entityName = 'FeatureTestParent';
      schemaCreateUpdate.hasTitle = true;

      const schemaRes = await schemasService.createSchemaByPrincipal(principal, schemaCreateUpdate, { upsert: true });

      expect(schemaRes).toBeInstanceOf(SchemaEntity);
      expect(schemaRes).toHaveProperty('id');

      parentSchema = schemaRes;

      const schemaCreateUpdateTwo = new SchemaCreateUpdateDto();
      schemaCreateUpdateTwo.name = 'feature test parent';
      schemaCreateUpdateTwo.moduleName = SchemaModuleTypeEnums.PROJECT_MODULE;
      schemaCreateUpdateTwo.entityName = 'FeatureTestChild';
      schemaCreateUpdateTwo.hasTitle = true;

      const schemaResTwo = await schemasService.createSchemaByPrincipal(
        principal,
        schemaCreateUpdateTwo,
        { upsert: true },
      );

      expect(schemaResTwo).toBeInstanceOf(SchemaEntity);
      expect(schemaResTwo).toHaveProperty('id');

      childSchema = schemaResTwo;


      try {

        const association = new SchemaAssociationCreateUpdateDto();
        association.type = SchemaAssociationCardinalityTypes.MANY_TO_ONE;
        association.childSchemaId = childSchema.id;

        const associationRes = await schemasAssociationService.createSchemaAssociationByPrincipal(
          principal,
          parentSchema.id,
          association,
        );

        expect(associationRes).toBeInstanceOf(SchemaAssociationEntity);
        expect(associationRes).toHaveProperty('id');

      } catch (e) {
        console.log(e)
      }

      done();

    })


    it('should create a Parent record', async (done) => {

      const body = new DbRecordCreateUpdateDto();
      body.entity = `${SchemaModuleTypeEnums.PROJECT_MODULE}:FeatureTestParent`;
      body.title = 'Test Parent Record';
      body.properties = {};

      const create = await dbService.updateOrCreateDbRecordsByPrincipal(
        principal,
        [ body ],
        { upsert: true },
      );
      console.log('createRes', create);
      expect(create).toHaveLength(1);

      featureComponentAId = create[0].id;

      done();
    })

    it('should create a Child Record', async (done) => {

      const body = new DbRecordCreateUpdateDto();
      body.entity = `${SchemaModuleTypeEnums.PROJECT_MODULE}:FeatureTestChild`;
      body.title = 'Test Child Record';
      body.properties = {};

      const create = await dbService.updateOrCreateDbRecordsByPrincipal(
        principal,
        [ body ],
        { upsert: true },
      );
      console.log('createRes', create);
      expect(create).toHaveLength(1);

      featureComponentBId = create[0].id;

      done();

    })

    it(
      'should create an association between a parent that does not have any relations to a child record',
      async (done) => {


        try {

          const create = new DbRecordAssociationCreateUpdateDto();
          create.recordId = featureComponentBId;

          const newAssociation = await dbRecordsAssociationsService.createRelatedRecords(
            principal,
            { recordId: featureComponentAId, body: [ create ] },
          );

          console.log('newAssociation', newAssociation);
          expect(newAssociation[0]).toBeInstanceOf(DbRecordAssociationEntity);
          expect(newAssociation[0]).toHaveProperty('id');

        } catch (e) {

          expect(e.statusCode).toBe(400);

        }

        done();
      },
    )

  })


  describe('self relations', () => {

    let featureComponentAId;
    let featureComponentBId;

    let schema: SchemaEntity;

    it('should create a schema and create a schema association to itself', async (done) => {

      const schemaCreateUpdate = new SchemaCreateUpdateDto();
      schemaCreateUpdate.name = 'feature test';
      schemaCreateUpdate.moduleName = SchemaModuleTypeEnums.PROJECT_MODULE;
      schemaCreateUpdate.entityName = 'FeatureTest';
      schemaCreateUpdate.hasTitle = true;

      const schemaRes = await schemasService.createSchemaByPrincipal(principal, schemaCreateUpdate, { upsert: true });

      expect(schemaRes).toBeInstanceOf(SchemaEntity);
      expect(schemaRes).toHaveProperty('id');

      schema = schemaRes;


      try {

        const association = new SchemaAssociationCreateUpdateDto();
        association.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
        association.childSchemaId = schemaRes.id;

        const associationRes = await schemasAssociationService.createSchemaAssociationByPrincipal(
          principal,
          schemaRes.id,
          association,
        );

        expect(associationRes).toBeInstanceOf(SchemaAssociationEntity);
        expect(associationRes).toHaveProperty('id');

      } catch (e) {
        console.log(e)
      }

      done();

    })


    it('should create a Feature Component', async (done) => {

      const body = new DbRecordCreateUpdateDto();
      body.entity = `${SchemaModuleTypeEnums.PROJECT_MODULE}:FeatureTest`;
      body.title = 'Test Feature 1';
      body.properties = {};

      const create = await dbService.updateOrCreateDbRecordsByPrincipal(
        principal,
        [ body ],
        { upsert: true },
      );
      console.log('createRes', create);
      expect(create).toHaveLength(1);

      featureComponentAId = create[0].id;

      done();
    })

    it('should create a second Feature Component', async (done) => {

      const body = new DbRecordCreateUpdateDto();
      body.entity = `${SchemaModuleTypeEnums.PROJECT_MODULE}:FeatureTest`;
      body.title = 'Test Feature 2';
      body.properties = {};

      const create = await dbService.updateOrCreateDbRecordsByPrincipal(
        principal,
        [ body ],
        { upsert: true },
      );
      console.log('createRes', create);
      expect(create).toHaveLength(1);

      featureComponentBId = create[0].id;

      done();

    })

    it('should throw an error creating self relation without a relationType property', async (done) => {


      try {

        const create = new DbRecordAssociationCreateUpdateDto();
        create.relationType = undefined;
        create.recordId = featureComponentBId;

        const newAssociation = await dbRecordsAssociationsService.createRelatedRecords(
          principal,
          { recordId: featureComponentAId, body: [ create ] },
        );

        console.log('newAssociation', newAssociation);
      } catch (e) {

        expect(e.statusCode).toBe(400);

        done();
      }

    })

    it('should create a self relation using the relationType property', async (done) => {

      const create = new DbRecordAssociationCreateUpdateDto();
      create.relationType = RelationTypeEnum.PARENT;
      create.recordId = featureComponentBId;

      console.log('create', create);

      const newAssociation = await dbRecordsAssociationsService.createRelatedRecords(
        principal,
        { recordId: featureComponentAId, body: [ create ] },
      );

      console.log('newAssociation', newAssociation);
      expect(newAssociation[0]).toBeInstanceOf(DbRecordAssociationEntity);
      expect(newAssociation[0]).toHaveProperty('id');

      done();

    })

  })


  describe('create create and update association columns', () => {

    let accountId;
    let contactId;

    let contactAssociation;

    it('should create an Account', async (done) => {

      const body = new DbRecordCreateUpdateDto();
      body.entity = `${SchemaModuleTypeEnums.CRM_MODULE}:${SchemaModuleEntityTypeEnums.ACCOUNT}`;
      body.title = 'Test McTest Account';
      body.properties = {
        Type: 'RESIDENTIAL',
        GroupBilling: 'YES',
      };

      const create = await dbService.updateOrCreateDbRecordsByPrincipal(
        principal,
        [ body ],
        { upsert: true },
      );
      console.log('createRes', create);
      expect(create).toHaveLength(1);

      accountId = create[0].id;

      done();
    })

    it('should create a Contact and relate it to the Account', async (done) => {

      const body = new DbRecordCreateUpdateDto();
      body.entity = `${SchemaModuleTypeEnums.CRM_MODULE}:${SchemaModuleEntityTypeEnums.CONTACT}`;
      body.title = 'Test McTest';
      body.properties = {
        FirstName: 'Test',
        LastName: 'McTest',
        Phone: '+4407001234567',
        EmailAddress: 'test@test.com',
      }
      body.associations = [
        {
          recordId: accountId,
        },
      ]

      const create = await dbService.updateOrCreateDbRecordsByPrincipal(
        principal,
        [ body ],
        { upsert: true },
      );
      console.log('createRes', create);
      expect(create).toHaveLength(1);

      contactId = create[0].id;

      done();
    })

    it('should get a Account the Contact relation', async (done) => {

      const associations = await dbRecordsAssociationsService.getRelatedRecordsByEntity(
        principal.organization,
        {
          recordId: accountId,
          entities: [ 'Contact' ],
        },
      );

      console.log('associations', associations);
      expect(associations['Contact'].dbRecords).toHaveLength(1);

      contactAssociation = associations['Contact'].dbRecords[0];

      done();

    })


    it('should update the contact Role', async (done) => {

      const body = new DbRecordAssociationCreateUpdateDto();
      body.properties = {
        Role: 'BILLING',
      }

      const update = await dbRecordsAssociationsService.updateRelatedRecordById(
        principal,
        {
          dbRecordAssociationId: contactAssociation.dbRecordAssociation.id,
          recordId: contactId,
          body,
        },
      );

      console.log('updateRes', update);

      const account = await dbService.getDbRecordTransformedByOrganizationAndId(
        principal.organization,
        accountId,
        [ 'Contact' ],
      );

      const contact = getFirstRelation(account, 'Contact');

      console.log('contact', contact);

      expect(getProperty(contact, 'Role')).toBe(body.properties['Role']);

      done();
    })


  })

  describe('create related records', () => {

    let orderItemId;
    let ontDeviceId;

    it('should create a test order item', async (done) => {

      // Create an Order Item
      const body = new DbRecordCreateUpdateDto();
      body.entity = `${SchemaModuleTypeEnums.ORDER_MODULE}:${SchemaModuleEntityTypeEnums.ORDER_ITEM}`;
      body.title = 'Test order item';
      body.properties = {
        Description: 'Test order item',
        ActivationStatus: 'OPEN',
        UnitPrice: 10,
        TotalPrice: 10,
        TaxIncluded: 'YES',
        Taxable: 'YES',
        TaxRate: 20,
        Quantity: 1,

        ProductCategory:'LABOR'
      };

      const orderItem = await dbService.updateOrCreateDbRecordsByPrincipal(
        principal,
        [ body ],
        { upsert: true },
      );
      console.log('orderItemRes', orderItem);
      expect(orderItem).toHaveLength(1);

      orderItemId = orderItem[0].id;

      done();
    })

    it('should create ONE_TO_ONE association with a new CustomerDeviceOnt', async (done) => {

      // Create a Customer Device Ont
      const body = new DbRecordCreateUpdateDto();
      body.entity = `${SchemaModuleTypeEnums.SERVICE_MODULE}:${SchemaModuleEntityTypeEnums.CUSTOMER_DEVICE_ONT}`;
      body.title = 'Test order item ( ont )';
      body.properties = {
        Model: '621_I',
        SerialNumber: randomSerial,
      };

      const createOnt = await dbService.updateOrCreateDbRecordsByPrincipal(
        principal,
        [ body ],
        { upsert: true },
      );
      console.log('createOntRes', createOnt);
      expect(createOnt).toHaveLength(1);

      ontDeviceId = createOnt[0].id;
      // Create an association to the Order Item

      const associationOne = await dbRecordsAssociationsService.createRelatedRecords(
        principal,
        { recordId: orderItemId, body: [ { recordId: createOnt[0].id } ] },
      );

      console.log('associationOne', associationOne);
      expect(associationOne).toHaveLength(1);
      // Remove the Customer Device Ont
      const removeAssociations = await dbRecordsAssociationsService.deleteRelatedRecordById(
        principal,
        associationOne[0].id,
      );

      console.log('removeAssociations', removeAssociations);
      expect(removeAssociations.affected).toBe(1);

      done();

    });

    it(
      'should NOT associate an already associated ONT with a new Order Item in a ONE_TO_ONE association',
      async (done) => {


        const associationOne = await dbRecordsAssociationsService.createRelatedRecords(
          principal,
          { recordId: orderItemId, body: [ { recordId: ontDeviceId } ] },
        );

        // Create an association to the Order Item
        const associationTwo = await dbRecordsAssociationsService.createRelatedRecords(
          principal,
          { recordId: orderItemId, body: [ { recordId: ontDeviceId } ] },
        );
        console.log('associationTwo', associationTwo);
        expect(associationTwo).toHaveLength(0);

        console.log('associationOne', associationOne);
        expect(associationOne).toHaveLength(1);
        // Remove the Customer Device Ont
        const removeAssociations = await dbRecordsAssociationsService.deleteRelatedRecordById(
          principal,
          associationOne[0].id,
        );

        console.log('removeAssociations', removeAssociations);
        expect(removeAssociations.affected).toBe(1);

        done();

      },
    )


    it('should fail to create an existing CustomerDeviceOnt', async (done) => {

      try {
        // Create a Customer Device Ont
        const body = new DbRecordCreateUpdateDto();
        body.entity = `${SchemaModuleTypeEnums.SERVICE_MODULE}:${SchemaModuleEntityTypeEnums.CUSTOMER_DEVICE_ONT}`;
        body.title = 'Test order item ( ont )';
        body.properties = {
          Model: '621_I',
          SerialNumber: randomSerial,
        };

        // Try to Create the Customer Deivce Ont again (same params)
        const createOnt = await dbService.updateOrCreateDbRecordsByPrincipal(
          principal,
          [ body ],
          { upsert: true },
        );
        console.log('createOnt', createOnt);
        expect(createOnt).toHaveLength(1);


      } catch (e) {
        expect(e.statusCode).toBe(409)
      }

      done();

    })
  });


  afterAll(async () => {
    await app.close();
  });
});
