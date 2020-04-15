import { ApiProperty } from '@nestjs/swagger';

export class ProcessOrderBillingDto {
    @ApiProperty()
    BillingStartDate: string;
    @ApiProperty()
    ContractStartDate: string
}
