import { ApiProperty } from "@nestjs/swagger";

/**
 * https://developer.gocardless.com/api-reference/#core-endpoints-customer-bank-accounts
 */
export class GocardlessCustomerBankAccountEntity {

    @ApiProperty()
    id?: string;

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

    /**
     * Example: "Frank Osborne"
     */
    @ApiProperty({ example: "Frank Osborne" })
    public accountHolderName: string;

    /**
     * Example: "GB"
     */
    @ApiProperty({ example: "GB" })
    public countryCode: string;

    @ApiProperty({ example: { key: 'value' } })
    public metadata?: object;


    public enabled?: boolean;

    public currency?: string;

    /**
     * Example: {customer: "CU123" }
     */
    @ApiProperty({ example: { customer: "CU123" } })
    public links: {

        customer: string;

    }

}
