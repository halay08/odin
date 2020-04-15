export interface GocardlessPaymentInterface {

    id?: string;
    amount: number; // e.g. pence in GBP, cents in EUR
    currency: string;
    charge_date?: string;
    description?: string;
    reference?: string;
    metadata?: object;
    links: {
        mandate: string;
    }

}
