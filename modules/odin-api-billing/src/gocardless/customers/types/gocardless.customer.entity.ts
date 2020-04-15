import { ApiProperty } from "@nestjs/swagger";

/**
 * https://developer.gocardless.com/api-reference/#core-endpoints-customers
 */
export class GocardlessCustomerEntity {

    @ApiProperty()
    id?: string;

    /**
     * Example: "user@example.com"
     */
    @ApiProperty()
    public email: string;

    /**
     * Example: "Frank"
     */
    @ApiProperty()
    public givenName: string;

    /**
     * Example: "Osborne"
     */
    @ApiProperty()
    public familyName: string;

    /**
     * Example: "27 Acer Road"
     */
    @ApiProperty()
    public addressLine1: string;

    /**
     * Example: "Apt 2"
     */
    @ApiProperty()
    public addressLine2: string;

    /**
     * Example:  "London"
     */
    @ApiProperty()
    public city: string;

    /**
     * Example: "E8 3GX"
     */
    @ApiProperty()
    public postalCode: string;

    /**
     * Example: "GB"
     */
    @ApiProperty()
    public countryCode: string;

    /**
     * Example:  { "salesforce_id": "ABCD1234" }
     */
    @ApiProperty()
    public metadata?: object;

}
