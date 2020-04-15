import { ApiProperty } from "@nestjs/swagger";

/**
 * https://developer.gocardless.com/api-reference/#helper-endpoints-bank-details-lookups
 */
export class GocardlessBankLookupEntity {

    /**
     * Example: "55779911"
     */
    @ApiProperty({ example: "55779911" })
    public accountNumber: string;

    /**
     * Example: "200000"
     */
    @ApiProperty({ example: "200000" })
    public branchCode: string;

    /**
     * Example: "GB"
     */
    @ApiProperty({ description: "Country Code", example: "GB" })
    public countryCode: string;

}
