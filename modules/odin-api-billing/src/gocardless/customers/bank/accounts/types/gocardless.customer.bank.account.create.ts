import { ApiProperty } from "@nestjs/swagger";

/**
 * https://developer.gocardless.com/api-reference/#core-endpoints-customer-bank-accounts
 */
export class GocardlessCustomerBankAccountCreate {

    /**
     * Example: "55779911"
     */
    @ApiProperty({ example: "55779911" })
    public accountNumber: string;

    /**
     * Example:  "200000"
     */
    @ApiProperty({ example: "200000" })
    public branchCode: string;

}
