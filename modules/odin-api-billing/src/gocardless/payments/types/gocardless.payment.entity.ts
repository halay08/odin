import { ApiProperty } from '@nestjs/swagger';

/**
 * https://developer.gocardless.com/api-reference/#mandates-create-a-mandate
 */
export class GocardlessPaymentEntity {

    @ApiProperty()
    public id?: string;
    @ApiProperty()
    public amount: number;
    @ApiProperty()
    public currency: string;
    @ApiProperty()
    public status: string;
    @ApiProperty()
    public charge_date?: string;
    @ApiProperty()
    public description?: string;
    @ApiProperty()
    public reference?: string;
    @ApiProperty()
    public metadata?: object;
    @ApiProperty()
    public links: {
        mandate: string;
    };

    public convertToCents(amount: string): number {
        if(!isNaN(Number(amount))) {

            const fixedDecimal = Number(amount).toFixed(2);
            const rounded = Math.round(parseFloat(fixedDecimal) * 100);

            return rounded;
        }
    }

}
