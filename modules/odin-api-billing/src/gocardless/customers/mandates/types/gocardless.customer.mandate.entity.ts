import { ApiProperty } from "@nestjs/swagger";

/**
 * https://developer.gocardless.com/api-reference/#mandates-create-a-mandate
 */
export class GocardlessCustomerMandateEntity {

    @ApiProperty()
    public id?: string;
    /**
     * Example: "bacs"
     */
    @ApiProperty()
    public scheme: string;

    /**
     * Example: { "contract": "ABCD1234" }
     */
    @ApiProperty()
    public metadata: object;

    public status?: string;

    public nextPossibleChargeDate?: string;

    /**
     * Example: {customer_bank_account: "BA123", creditor: "CR123" }
     */
    @ApiProperty({ example: { customer_bank_account: "BA123", creditor: "CR123" } })
    public links: {
        customer_bank_account: string,
        creditor?: string;
        customer?: string;
    }

}
