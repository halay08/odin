import { changeKeysSnakeCaseToCamelCase } from "../../../src/helpers/TransformData";
import { GocardlessCustomersBankAccountsControllerHelpers } from "../../helpers/gocardless.customers.bank.accounts.controller.helpers";
import { GocardlessCustomerEntity } from "../../../src/gocardless/customers/types/gocardless.customer.entity";
import { GocardlessCustomersControllerHelpers } from "../../helpers/gocardless.customers.controller.helpers";
import { GocardlessCustomerBankAccountEntity } from "../../../src/gocardless/customers/bank/accounts/types/gocardless.customer.bank.account.entity";

const createCustomerJson = require("../resources/fixtures/client/create_a_customer_request.json");

describe("gocardless customers bank accounts controller integration test", () => {

    let customer: GocardlessCustomerEntity;
    let bankAccount: GocardlessCustomerBankAccountEntity;

    test('list all bank accounts', async done => {
        const res = await GocardlessCustomersBankAccountsControllerHelpers.listAll();

        console.log(res.response.data);
        expect(res.successful).toBe(true);
        done();
    });

    test('create one gocardless customers', async done => {

        const parseToCamelCase = await changeKeysSnakeCaseToCamelCase<GocardlessCustomerEntity>(createCustomerJson);
        console.log(parseToCamelCase);
        const res = await GocardlessCustomersControllerHelpers.createOne(parseToCamelCase);

        console.log(res.response.data);
        expect(res.successful).toBe(true);
        expect(res.response.data).toHaveProperty('id');

        customer = res.response.data;

        done();
    });


    test('create one gocardless bank account', async done => {

        const payload = {
            "account_number": "55779911",
            "branch_code": "200000",
            "account_holder_name": "Frank Osborne",
            "country_code": "GB",
            "links": {
                "customer": customer.id,
            },
        };

        const parseToCamelCase = await changeKeysSnakeCaseToCamelCase<GocardlessCustomerBankAccountEntity>(payload);
        console.log(parseToCamelCase);
        const res = await GocardlessCustomersBankAccountsControllerHelpers.createOne(parseToCamelCase);

        console.log(res.response);
        expect(res.successful).toBe(true);

        bankAccount = res.response.data;

        done();
    });

    test('update one gocardless bank account', async done => {

        const payload = {
            "metadata": {
                key: 'value',
            },
        };

        const parseToCamelCase = await changeKeysSnakeCaseToCamelCase<GocardlessCustomerBankAccountEntity>(payload);
        console.log(parseToCamelCase);
        const res = await GocardlessCustomersBankAccountsControllerHelpers.updateOne(bankAccount.id, parseToCamelCase);

        console.log(res.response.data);
        expect(res.successful).toBe(true);
        done();
    });

    test('delete one gocardless bank account', async done => {

        const res = await GocardlessCustomersBankAccountsControllerHelpers.disableOne(bankAccount.id);
        console.log(res.response.data);
        expect(res.successful).toBe(true);
        // expect(res.response.data.customers).toBe(true);
        done();
    });


})
