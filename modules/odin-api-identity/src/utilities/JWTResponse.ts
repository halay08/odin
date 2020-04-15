import { ApiProperty } from "@nestjs/swagger";

export class JWTResponse {

    @ApiProperty()
    public token: string;

    @ApiProperty()
    public expiresIn: number;

}
