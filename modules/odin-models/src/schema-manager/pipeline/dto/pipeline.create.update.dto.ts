import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, Length } from 'class-validator';
import { SchemaModuleTypeEnums } from '../../schema/types/schema.module.types';

export class PipelineCreateUpdateDto {

  @ApiProperty()
  @Length(3, 55)
  public name: string;

  @ApiProperty()
  @IsOptional()
  @Length(4, 255)
  public key: string;

  @ApiProperty()
  @Length(1, 255)
  public description: string;

  @ApiProperty()
  @IsEnum(SchemaModuleTypeEnums)
  public moduleName: SchemaModuleTypeEnums;

  @ApiProperty()
  @Length(2, 55)
  public entityName: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  public isDefault?: boolean;

}

