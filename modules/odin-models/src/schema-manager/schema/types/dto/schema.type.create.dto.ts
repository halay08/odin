import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsUUID, Length } from 'class-validator';


export class SchemaTypeCreateDto {

  @ApiProperty({ description: 'uuidv4', example: 'fa4f29c7-6606-4d6d-8121-5d5d5f1a6aac' })
  @IsUUID('4')
  public schemaId: string;

  @ApiProperty()
  @Length(1, 55)
  public name: string;

  @ApiProperty()
  @Length(1, 55)
  public label: string;

  @ApiProperty()
  @Length(1, 255)
  public description: string;

  @ApiProperty()
  @IsBoolean()
  public isDefault: boolean;

}
