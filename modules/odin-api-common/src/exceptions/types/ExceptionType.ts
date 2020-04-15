import { ClassValidatorExceptionType } from "./ClassValidatorExceptionType";
import { ApiProperty }                 from "@nestjs/swagger";

export class ExceptionType {

    @ApiProperty()
    public statusCode: number;

    @ApiProperty()
    public timestamp: string;

    @ApiProperty()
    public path: string;

    @ApiProperty()
    public message: string;

    @ApiProperty()
    public validation?: ClassValidatorExceptionType[];

    @ApiProperty()
    public data?: any;

    public constructor(
        statusCode: number,
        message: string,
        validation?: ClassValidatorExceptionType[],
        data?: any
    ) {

        this.statusCode = statusCode;
        this.message = message;
        this.validation = validation;
        this.data = data;

    }

}
