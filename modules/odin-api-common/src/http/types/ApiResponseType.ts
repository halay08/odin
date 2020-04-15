import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseType<T> {

    @ApiProperty()
    public statusCode: number;

    @ApiProperty()
    public successful: boolean;

    @ApiProperty()
    public message: string;

    @ApiProperty()
    public data: T;

    constructor(statusCode: number, message: string, data: T) {
        this.statusCode = statusCode;
        this.successful = [ 200, 201, 202, 203 ].includes(statusCode);
        this.message = message;
        this.data = data;
    }
}
