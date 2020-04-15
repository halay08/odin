import { ApiProperty } from "@nestjs/swagger";

export class TransactionRefundCreateDto {
    @ApiProperty()
    public amount?: string;
    /**
     * To manually add a refund referenceId
     */
    @ApiProperty()
    public refundId?: string;
}
