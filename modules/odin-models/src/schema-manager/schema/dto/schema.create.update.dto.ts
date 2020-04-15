import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class SchemaCreateUpdateDto {

  @ApiProperty()
  @Length(3, 55)
  public name: string;

  @ApiProperty()
  @IsOptional()
  @Length(0, 255)
  public description?: string;

  @ApiProperty()
  @Length(3, 55)
  public moduleName: string;

  @ApiProperty()
  @Length(2, 55)
  public entityName: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  public recordNumber?: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @Length(0, 32)
  public recordNumberPrefix?: string;

  @ApiProperty()
  @IsUUID('4')
  @IsOptional()
  public recordDefaultOwnerId?: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  public assignable: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  public searchUrl?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  public getUrl?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  public postUrl?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  public putUrl?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  public deleteUrl?: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  public isSequential?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  public isStatic?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  public isHidden?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  public hasTitle?: boolean;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  public position?: number;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  public upsertOnCreate?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  public isTitleUnique?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  public isTitleRequired?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  public queryable?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  public replicateable?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  public retrievable?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  public searchable?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  public triggerable?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  public undeletable?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  public updateable?: boolean;

}
