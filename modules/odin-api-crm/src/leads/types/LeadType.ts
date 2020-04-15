import { ApiProperty } from '@nestjs/swagger';

export class LeadType {

    @ApiProperty()
    public Type?: string;

    @ApiProperty()
    public Source?: string;

    @ApiProperty()
    public Name?: string;

    @ApiProperty()
    public OrganizationEntityName?: string;

    @ApiProperty()
    public FirstName?: string;

    @ApiProperty()
    public LastName?: string;

    @ApiProperty()
    public EmailAddress?: string;

    @ApiProperty()
    public Phone?: string;


}
