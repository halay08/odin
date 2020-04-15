import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';


export class PipelineStageCreateUpdateDto {

  @ApiProperty()
  @Length(3, 55)
  public name: string;

  @ApiProperty()
  @Length(3, 255)
  public key: string;

  @ApiProperty()
  @Length(1, 255)
  public description: string;

  @ApiProperty()
  public position: number;

  @ApiProperty()
  @Optional()
  public isDefault?: boolean;

  @ApiProperty()
  @Optional()
  public isSuccess?: boolean;

  @ApiProperty()
  @Optional()
  public isFail?: boolean;

}

