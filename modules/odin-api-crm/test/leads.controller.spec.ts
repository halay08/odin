import { SchemaManagerTestHelpers } from "./helpers/SchemaManagerTestHelpers";
import { LeadControllerTestHelpers } from "./helpers/LeadControllerTestHelpers";
import { AccountControllerTestHelpers } from "./helpers/AccountControllerTestHelpers";
import { ContactControllerTestHelpers } from "./helpers/ContactControllerTestHelpers";
import { OrganizationEntityControllerTestHelpers } from "./helpers/OrganizationControllerTestHelpers";
import { SchemaModuleTypeEnums } from "@d19n/models/dist/schema-manager/schema/types/schema.module.types";
import { SchemaModuleEntityTypeEnums } from "@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types";
import { DbRecordCreateUpdateDto } from "@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto";
import { DbRecordEntityTransform } from "@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform";

describe('E2E integration test', () => {

    let organization: DbRecordEntityTransform;
    let contact: DbRecordEntityTransform;
    let lead: DbRecordEntityTransform;
    let account: DbRecordEntityTransform;


    test('Create a new Lead', async done => {
        // Get the schema
        const schemaRes = await SchemaManagerTestHelpers.getSchemaByModuleAndEntity(
            SchemaModuleTypeEnums.CRM_MODULE,
            SchemaModuleEntityTypeEnums.LEAD,
        );
        expect(schemaRes.successful).toBe(true);
        const schema = schemaRes.response.data;
        // prepare a new record to be created
        const recordCreate: DbRecordCreateUpdateDto = LeadControllerTestHelpers.constructNewLead(schema.id);
        const create = await SchemaManagerTestHelpers.dbServicePostRequest(
            SchemaModuleEntityTypeEnums.LEAD,
            [ recordCreate ],
        );
        console.log('create', create);
        lead = create.response.data[0];
        console.log('lead', lead);
        done();
    }, 10000);

    test('Create a new Contact', async done => {
        // Get the schema
        const schemaRes = await SchemaManagerTestHelpers.getSchemaByModuleAndEntity(
            SchemaModuleTypeEnums.CRM_MODULE,
            SchemaModuleEntityTypeEnums.CONTACT,
        );
        expect(schemaRes.successful).toBe(true);
        const schema = schemaRes.response.data;
        // prepare a new record to be created
        const recordCreate: DbRecordCreateUpdateDto = ContactControllerTestHelpers.constructNewContact(
            schema.id,
            lead.id,
        );
        // create the new record in the database
        const create = await SchemaManagerTestHelpers.dbServicePostRequest(
            SchemaModuleEntityTypeEnums.CONTACT,
            [ recordCreate ],
        );

        console.log('create', create);
        contact = create.response.data[0];
        console.log('contact', contact);
        done();
    }, 10000);

    test('Create a new OrganizationEntity', async done => {
        // Get the schema
        const schemaRes = await SchemaManagerTestHelpers.getSchemaByModuleAndEntity(
            SchemaModuleTypeEnums.CRM_MODULE,
            SchemaModuleEntityTypeEnums.ORGANIZATION,
        );
        expect(schemaRes.successful).toBe(true);
        const schema = schemaRes.response.data;
        // prepare a new record to be created
        const recordCreate: DbRecordCreateUpdateDto = OrganizationEntityControllerTestHelpers.constructNewOrganizationEntity(
            schema.id,
            lead.id,
        );
        // create the new record in the database
        const create = await SchemaManagerTestHelpers.dbServicePostRequest(
            SchemaModuleEntityTypeEnums.ORGANIZATION,
            [ recordCreate ],
        );
        console.log('create', create);
        organization = create.response.data[0];
        console.log('organization', organization);
        done();
    }, 10000);


    test('Create a new Account from a Lead', async done => {
        const res = await AccountControllerTestHelpers.createAccountFromLead(lead.id);
        console.log(res);
        expect(res.successful).toBe(true);
        console.log(res);
        account = res[0];
        done();
    }, 10000);

});
