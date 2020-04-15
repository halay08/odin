import { ApiProperty }        from '@nestjs/swagger';
import { IsNotEmpty, Length } from 'class-validator';

export class OrganizationUserTokenCreate {

    @ApiProperty()
    @IsNotEmpty()
    @Length(1, 255)
    public name: string;

    @ApiProperty()
    public description: string;

}
