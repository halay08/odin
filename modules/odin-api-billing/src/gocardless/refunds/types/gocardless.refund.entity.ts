import { ApiProperty } from '@nestjs/swagger';

/**
 * https://developer.gocardless.com/api-reference/#refunds-create-a-refund
 */
export class GocardlessRefundEntity {

    @ApiProperty()
    public id?: string;
    @ApiProperty()
    public amount: number;
    @ApiProperty()
    public totalAmountConfirmation: number;
    @ApiProperty()
    public reference?: string;
    @ApiProperty()
    public metadata?: object;
    @ApiProperty()
    public links: {
        payment: string;
    };

    public convertToCents(amount: string): number {
        if(!isNaN(Number(amount))) {

            const fixedDecimal = Number(amount).toFixed(2);
            const rounded = Math.round(parseFloat(fixedDecimal) * 100);

            return rounded;
        }
    }

}
