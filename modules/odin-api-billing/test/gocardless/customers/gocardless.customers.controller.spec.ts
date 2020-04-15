import { GocardlessCustomersControllerHelpers } from "../../helpers/gocardless.customers.controller.helpers";
import { changeKeysSnakeCaseToCamelCase } from "../../../src/helpers/TransformData";
import { GocardlessCustomerEntity } from "../../../src/gocardless/customers/types/gocardless.customer.entity";

const createCustomerJson = require("../resources/fixtures/client/create_a_customer_request.json");
const updateCustomerJson = require("../resources/fixtures/client/update_a_customer_request.json");


describe("gocardless customer controller integration test", () => {

    let customer: GocardlessCustomerEntity;

    test('list all customers', async done => {
        const res = await GocardlessCustomersControllerHelpers.listAll();

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

    test('get one gocardless customers', async done => {

        const parseToCamelCase = await changeKeysSnakeCaseToCamelCase<GocardlessCustomerEntity>(updateCustomerJson);
        console.log(parseToCamelCase);
        const res = await GocardlessCustomersControllerHelpers.getOne(customer.id);

        console.log(res.response.data);
        expect(res.successful).toBe(true);
        expect(res.response.data).toHaveProperty('id');
        done();
    });

    test('update one gocardless customers', async done => {

        const parseToCamelCase = await changeKeysSnakeCaseToCamelCase<GocardlessCustomerEntity>(updateCustomerJson);
        console.log(parseToCamelCase);
        const res = await GocardlessCustomersControllerHelpers.updateOne(customer.id, parseToCamelCase);

        console.log(res.response.data);
        expect(res.successful).toBe(true);
        expect(res.response.data).toHaveProperty('id');
        done();
    });

    test('delete one gocardless customers', async done => {

        const res = await GocardlessCustomersControllerHelpers.deleteOne(customer.id);
        console.log(res.response.data);
        expect(res.successful).toBe(true);
        // expect(res.response.data.customers).toBe(true);
        done();
    });


})
