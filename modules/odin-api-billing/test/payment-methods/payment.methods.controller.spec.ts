import { DbRecordCreateUpdate } from "@d19n/models/dist/schema-manager/db/record/db.record.create.update";
import { PaymentMethodsControllerHelpers } from "../helpers/payment.methods.controller.helpers";
import { DbRecordEntity } from "@d19n/models/dist/schema-manager/db/record/db.record.entity";
import { PaymentMethodMandateCreate } from "../../src/payment-methods/types/payment.method.mandate.create";
import { SchemaModuleTypeEnums } from "@d19n/models/dist/schema-manager/schema/schema.module.types";
import { SchemaModuleEntityTypeEnums } from "@d19n/models/dist/schema-manager/schema/schema.module.entity.types";
import { AuthUserHelper } from "../helpers/AuthUserHelper";
import { BaseHttpClient } from "../../src/common/Http/BaseHttpClient";


describe("create a new customer paymeht method", () => {

    let contact: DbRecordEntity;

    const client = new BaseHttpClient();

    test("create a new Odin customer", async done => {
        // Authenticate a new user
        const user = await AuthUserHelper.login();
        // construct a new contact record and billing address
        const records: DbRecordCreateUpdate[] = [
            {
                "entity": `${SchemaModuleTypeEnums.CRM_MODULE}:${SchemaModuleEntityTypeEnums.CONTACT}`,
                "properties": {
                    "FirstName": "Jeremy553",
                    "LastName": "Chelot512",
                    "EmailAddress": "jeremy459729@4ty9.co",
                    "Phone": "07911 123456",
                    "Mobile": null,
                    "CompanyName": "YouFibre",
                    "HearAboutUs": "salesperson",
                    "ReferralEmail": null,
                    "CompanyPosition": "CEO",
                },
            },
            {
                "entity": `${SchemaModuleTypeEnums.CRM_MODULE}:${SchemaModuleEntityTypeEnums.ADDRESS}`,
                "properties": {
                    "AddressLine1": "32 Page Street",
                    "UMPRN": "000",
                    "UDPRN": "23722355560",
                    "CountryCode": "GB",
                    "PostalCode": "SW1P 4EN",
                    "City": "LONDON",
                    "AddressLine2": "",
                    "Type": "BILLING",
                    "SalesStatus": "PRE_ORDER",
                    "AvailableSeason": "Spring",
                    "AvailableYear": "2021",
                    "FullAddress": null,
                    "AddressLine3": null,
                    "Premise": null,
                    "PostTown": null,
                },
            },
        ];

        const createRes = await client.postRequest(
            'https://api.sandbox.odinfusion.com',
            'CrmModule/v1.0/db/batch',
            user.token,
            records,
        );

        console.log(createRes);
        const created = createRes['data'];

        contact = created.find(elem => elem.schema.entityName === 'Contact');

        done();

    }, 20000);

    test("create a new gocardless mandate for the customer", async done => {

        const body: PaymentMethodMandateCreate = {
            identityName: 'GOCARDLESS',
            bankDetails: {
                "accountNumber": "55779911",
                "branchCode": "200000",
            },
        };

        const res = await PaymentMethodsControllerHelpers.createCustomerMandatePaymentMethod(contact.id, body);
        console.log(res);
        expect(res.successful).toBe(true);

        console.log(res.response.data);

        done();

    }, 20000);

});
