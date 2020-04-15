import { ApiProperty } from "@nestjs/swagger";

export class TransactionPaymentCreateDto {
    @ApiProperty()
    public paymentMethodId?: string;
}
