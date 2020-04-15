import { DbRecordAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/association/dto/db.record.association.create.update.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class DbRecordMergeDto {

  @ApiProperty()
  @IsUUID('4')
  masterRecordId: string;

  @ApiProperty()
  @IsUUID('4')
  mergeRecordId: string;
  // associations to add to the master
  @ApiProperty()
  @IsOptional()
  associations: DbRecordAssociationCreateUpdateDto[];

  // properties to preserve for the master record
  @ApiProperty()
  @IsOptional()
  properties?: { [key: string]: any };

}
