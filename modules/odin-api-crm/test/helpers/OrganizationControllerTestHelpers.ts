import * as dotenv from "dotenv";
import * as faker from 'faker';

dotenv.config();


export class OrganizationEntityControllerTestHelpers {

    /**
     * Construct a new test order
     */
    public static constructNewOrganizationEntity(schemaId: string, parentRecordId?: string) {
        return {
            schemaId,
            properties: {
                Name: faker.name.findName(),
                EmailAddress: faker.internet.exampleEmail(),
                Phone: '07911 123456',
                Website: 'www.google.com',
            },
            associations: [
                { recordId: parentRecordId },
            ],
        }
    }
}
