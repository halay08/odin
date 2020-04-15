import { ApiProperty }                 from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length } from "class-validator";

export class IdentityOrganizationUserRegister {

    @ApiProperty()
    @IsNotEmpty()
    @Length(2, 32)
    public organizationName: string;

    @ApiProperty()
    @IsEmail()
    public email: string;

    @ApiProperty()
    @IsNotEmpty()
    @Length(8, 15)
    public password: string;

    @ApiProperty()
    @IsNotEmpty()
    @Length(2, 32)
    public firstname: string;

    @ApiProperty()
    @IsNotEmpty()
    @Length(2, 32)
    public lastname: string;

}
