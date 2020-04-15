import { IsIn }                              from 'class-validator';
import { ApiProperty }                       from "@nestjs/swagger";
import { SCHEMA_COLUMN_VALIDATOR_TYPE_KEYS } from "./schema.column.validator.types";

export class SchemaColumnValidatorCreateUpdate {

    @ApiProperty()
    @IsIn(SCHEMA_COLUMN_VALIDATOR_TYPE_KEYS)
    public type: string;

}
