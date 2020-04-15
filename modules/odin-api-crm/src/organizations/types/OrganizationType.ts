import { ApiProperty } from '@nestjs/swagger';

export class OrganizationEntityType {

    @ApiProperty()
    public OrganizationEntityName?: string;

    @ApiProperty()
    public EmailAddress?: string;

    @ApiProperty()
    public Phone?: string;

    @ApiProperty()
    public Website?: string;

}
