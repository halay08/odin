export class GocardlessBankLookupResponse {
    public bank_details_lookups: {
        bank_name: string;
        available_debit_schemes: object[];
        bic: string;
    }
}
