import { ApiProperty } from '@nestjs/swagger';

export class QueryCreateUpdateDto {

    @ApiProperty()
    public name?: string;

    @ApiProperty()
    public description?: string;

    @ApiProperty()
    public type?: 'ELASTIC_SEARCH' | 'SQL';

    @ApiProperty()
    public query?: string;

    @ApiProperty()
    public params?: { [key: string]: any };
}
