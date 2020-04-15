import { ApiProperty } from '@nestjs/swagger';

export class AccountType {

    @ApiProperty()
    public Type?: string;

    @ApiProperty()
    public Status?: string;

    @ApiProperty()
    public GroupBilling?: string;

}
