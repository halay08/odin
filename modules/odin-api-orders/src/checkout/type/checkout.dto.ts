import { DbRecordAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/association/dto/db.record.association.create.update.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CheckoutDto {
    @ApiProperty()
    public addressId: string;
    @ApiProperty()
    public contactId: string;
    @ApiProperty()
    public products: DbRecordAssociationCreateUpdateDto[];
    @ApiProperty()
    public discountCode?: string;
}
