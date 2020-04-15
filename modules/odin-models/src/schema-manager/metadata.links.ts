import { ApiProperty } from "@nestjs/swagger";

export class MetadataLinks {

    @ApiProperty()
    public title: string;
    @ApiProperty()
    public id: string;
    @ApiProperty()
    public record_number?: string;
    @ApiProperty()
    public entity: string;
    @ApiProperty()
    public type: string;
    @ApiProperty()
    public relation: 'child' | 'parent';
}
