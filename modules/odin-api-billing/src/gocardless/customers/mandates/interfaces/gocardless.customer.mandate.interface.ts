export interface GocardlessCustomerMandateInterface {

    id?: string;
    scheme: string;
    metadata: object;
    reference?: string;
    status?: string;
    next_possible_charge_date?: string;
    links: {
        customer_bank_account: string;
        creditor?: string;
        customer?: string;
    }

}
