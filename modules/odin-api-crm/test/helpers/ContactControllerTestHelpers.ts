import * as dotenv from "dotenv";
import * as faker from 'faker';

dotenv.config();

export class ContactControllerTestHelpers {

    /**
     * Construct a new test order
     */
    public static constructNewContact(schemaId: string, parentRecordId?: string) {
        return {
            schemaId,
            properties: {
                FirstName: faker.name.findName(),
                LastName: faker.name.lastName(),
                EmailAddress: faker.internet.exampleEmail(),
                Phone: '07911 123456',
                Mobile: '07911 123456',
            },
            associations: [
                { recordId: parentRecordId },
            ],
        }
    }
}
