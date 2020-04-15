import { ApiProperty } from "@nestjs/swagger";
import { IsEmail }     from "class-validator";

export class IdentityOrganizationUserForgotPassword {

    @ApiProperty()
    @IsEmail()
    public email: string

}
