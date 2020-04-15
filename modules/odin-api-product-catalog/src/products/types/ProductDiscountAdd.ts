import { ApiProperty } from "@nestjs/swagger";

export class ProductDiscountAdd {
    @ApiProperty({ example: { id: "uuid" } })
    discount: { id: string };
}
