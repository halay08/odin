import { ApiProperty } from "@nestjs/swagger";

export class IdentityOrganizationUserLoginResponse {

    @ApiProperty()
    public expiresIn: number;
    @ApiProperty()
    public token: string;

}
