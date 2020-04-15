export interface GocardlessCustomerBankAccountInterface {

    id?: string;
    account_number: string;
    branch_code: string;
    account_holder_name: string;
    country_code: string;
    links: {
        customer: string;
    }

}
