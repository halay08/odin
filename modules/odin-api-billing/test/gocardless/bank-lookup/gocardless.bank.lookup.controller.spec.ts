import { GocardlessBankLookupEntity } from "../../../src/gocardless/bank-lookup/types/gocardless.bank.lookup.entity";
import { GocardlessBankLookupControllerHelpers } from "../../helpers/gocardless.bank.lookup.controller.helpers";

describe("gocardless bank lookup controller integration test", () => {

    test("Lookup a customers bank details correct bank details", async done => {

        const bankDetails = new GocardlessBankLookupEntity();

        bankDetails.accountNumber = "55779911";
        bankDetails.branchCode = "200000";
        bankDetails.countryCode = "GB";

        const res = await GocardlessBankLookupControllerHelpers.lookupOne(bankDetails);
        console.log(res);
        expect(res.successful).toBe(true);

        done();
    });

    test("Lookup a customers bank details incorrect bank details", async done => {

        const bankDetails = new GocardlessBankLookupEntity();

        bankDetails.accountNumber = "11223344";
        bankDetails.branchCode = "200000";
        bankDetails.countryCode = "GB";

        const res = await GocardlessBankLookupControllerHelpers.lookupOne(bankDetails);
        console.log(res);

        expect(res.successful).toBe(false);

        done();
    });
});
