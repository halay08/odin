import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, Length } from "class-validator";

export class IdentityOrganizationUserChangePassword {

  @ApiProperty()
  @IsNotEmpty()
  public email: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(8, 15)
  public password: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(8, 15)
  public confirmPassword: string;

}
