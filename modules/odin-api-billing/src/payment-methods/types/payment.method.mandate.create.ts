import { ApiProperty } from '@nestjs/swagger';
import { GocardlessCustomerBankAccountCreate } from '../../gocardless/customers/bank/accounts/types/gocardless.customer.bank.account.create';

export class PaymentMethodMandateCreate {

    @ApiProperty()
    public identityName: string;

    @ApiProperty()
    public bankDetails: GocardlessCustomerBankAccountCreate;

    @ApiProperty()
    public authorizedDirectDebit?: boolean;
}
