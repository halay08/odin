export interface GocardlessRefundInterface {

    id?: string;
    created_at?: string;
    amount: number; // e.g. pence in GBP, cents in EUR
    currency: string;
    reference?: string;
    fx: {
        fx_currency: string,
        fx_amount: string | null,
        exchange_rate: string | null,
        estimated_exchange_rate: string
    },
    metadata?: object;
    links: {
        payment: string;
    }
}
