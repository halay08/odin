import { changeKeysSnakeCaseToCamelCase } from "../../../src/helpers/TransformData";
import { GocardlessPaymentEntity } from "../../../src/gocardless/payments/types/gocardless.payment.entity";
import { GocardlessRefundEntity } from "../../../src/gocardless/refunds/types/gocardless.refund.entity";
import { GocardlessPaymentsControllerHelpers } from "../../helpers/gocardless.payments.controller.helpers";
import { GocardlessCustomerEntity } from "../../../src/gocardless/customers/types/gocardless.customer.entity";
import { GocardlessCustomersControllerHelpers } from "../../helpers/gocardless.customers.controller.helpers";
import { GocardlessCustomerBankAccountEntity } from "../../../src/gocardless/customers/bank/accounts/types/gocardless.customer.bank.account.entity";
import { GocardlessCustomersBankAccountsControllerHelpers } from "../../helpers/gocardless.customers.bank.accounts.controller.helpers";
import { GocardlessCustomerMandateEntity } from "../../../src/gocardless/customers/mandates/types/gocardless.customer.mandate.entity";
import { GocardlessCustomersMandatesControllerHelpers } from "../../helpers/gocardless.customers.mandates.controller.helpers";
import { GocardlessRefundsControllerHelpers } from "../../helpers/gocardless.refunds.controller.helpers";

const createCustomerJson = require("../resources/fixtures/client/create_a_customer_request.json");

describe("gocardless payments / refunds controller integration test", () => {

    let customer: GocardlessCustomerEntity;
    let bankAccount: GocardlessCustomerBankAccountEntity;
    let mandate: GocardlessCustomerMandateEntity;
    let payment: GocardlessPaymentEntity;
    let refund: GocardlessRefundEntity;

    test('list all payments', async done => {
        const res = await GocardlessPaymentsControllerHelpers.listAll();

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

        console.log(res.response.data);
        expect(res.successful).toBe(true);

        bankAccount = res.response.data;

        done();
    });


    test('create one gocardless mandate', async done => {

        const payload = {
            scheme: "bacs",
            metadata: {
                test: "test",
            },
            links: {
                customer_bank_account: bankAccount.id,
            },
        };

        const parseToCamelCase = await changeKeysSnakeCaseToCamelCase<GocardlessCustomerMandateEntity>(payload);
        console.log(parseToCamelCase);
        const res = await GocardlessCustomersMandatesControllerHelpers.createOne(parseToCamelCase);

        console.log(res.response.data);
        expect(res.successful).toBe(true);

        mandate = res.response.data;

        done();
    });

    test('create one gocardless payment', async done => {

        const parseToCamelCase = await changeKeysSnakeCaseToCamelCase<GocardlessPaymentEntity>({
            amount: 2000,
            currency: 'GBP',
            links: { mandate: mandate.id },
            metadata: { foo: 'bar' },
        });
        console.log(parseToCamelCase);
        const res = await GocardlessPaymentsControllerHelpers.createOne(parseToCamelCase);

        console.log(res.response.data);
        expect(res.successful).toBe(true);
        expect(res.response.data).toHaveProperty('id');

        payment = res.response.data;

        done();
    });

    test('create one gocardless full refund', async done => {

        const parseToCamelCase = await changeKeysSnakeCaseToCamelCase<GocardlessRefundEntity>({
            amount: 2000,
            links: { payment: payment.id },
            metadata: { foo: 'bar' },
        });
        console.log(parseToCamelCase);
        const res = await GocardlessRefundsControllerHelpers.createOne(parseToCamelCase);

        console.log(res.response.data);
        expect(res.successful).toBe(true);
        expect(res.response.data).toHaveProperty('id');

        refund = res.response.data;

        done();
    });


    test('create one gocardless payment', async done => {

        const parseToCamelCase = await changeKeysSnakeCaseToCamelCase<GocardlessPaymentEntity>({
            amount: 2000,
            currency: 'GBP',
            links: { mandate: mandate.id },
            metadata: { foo: 'bar' },
        });
        console.log(parseToCamelCase);
        const res = await GocardlessPaymentsControllerHelpers.createOne(parseToCamelCase);

        console.log(res.response.data);
        expect(res.successful).toBe(true);
        expect(res.response.data).toHaveProperty('id');

        payment = res.response.data;

        done();
    });

    test('create one gocardless partial refund', async done => {

        const parseToCamelCase = await changeKeysSnakeCaseToCamelCase<GocardlessRefundEntity>({
            amount: 1000,
            links: { payment: payment.id },
            metadata: { foo: 'bar' },
        });
        console.log(parseToCamelCase);
        const res = await GocardlessRefundsControllerHelpers.createOne(parseToCamelCase);

        console.log(res.response.data);
        expect(res.successful).toBe(true);
        expect(res.response.data).toHaveProperty('id');

        refund = res.response.data;

        done();
    });

    test('create one gocardless over refund', async done => {

        const parseToCamelCase = await changeKeysSnakeCaseToCamelCase<GocardlessRefundEntity>({
            amount: 3000,
            links: { payment: payment.id },
            metadata: { foo: 'bar' },
        });
        console.log(parseToCamelCase);
        const res = await GocardlessRefundsControllerHelpers.createOne(parseToCamelCase);

        console.log(res.response.data);
        expect(res.successful).toBe(true);
        expect(res.response.data).toHaveProperty('id');

        refund = res.response.data;

        done();
    });


})
