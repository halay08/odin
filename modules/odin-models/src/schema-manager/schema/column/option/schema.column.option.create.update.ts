import { ApiProperty }      from "@nestjs/swagger";
import { IsNumber, Length } from "class-validator";


export class SchemaColumnOptionCreateUpdate {

    @ApiProperty()
    @Length(1, 32)
    public label: string;

    @ApiProperty()
    @Length(1, 32)
    public value: string;

    @ApiProperty()
    @IsNumber()
    public position: number;

}
