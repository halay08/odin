import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { DbRecordAssociationCreateUpdateDto } from '../association/dto/db.record.association.create.update.dto';

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
