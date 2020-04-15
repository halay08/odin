import { ApiProperty } from '@nestjs/swagger';

export class ContactType {

    @ApiProperty()
    public FirstName?: string;

    @ApiProperty()
    public LastName?: string;

    @ApiProperty()
    public EmailAddress?: string;

    @ApiProperty()
    public Phone?: string;

    @ApiProperty()
    public Mobile?: string;

}
