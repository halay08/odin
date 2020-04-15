import { ApiProperty } from "@nestjs/swagger";

export class ProductComponentsAdd {
    @ApiProperty({ example: [ { id: "uuid", quantity: 1 } ] })
    components: { id: string, quantity: number }[];
}
