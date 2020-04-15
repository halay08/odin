import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { SchemaColumnOptionCreateUpdate } from '../option/schema.column.option.create.update';
import { SchemaColumnTypes } from '../types/schema.column.types';


export class SchemaColumnCreateUpdateDto {

  //
  // Relationships
  //
  @ApiProperty()
  @IsArray()
  @IsOptional()
  public options?: SchemaColumnOptionCreateUpdate[];

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  public validators?: string[];

  @ApiProperty({ description: 'uuidv4', example: 'fa4f29c7-6606-4d6d-8121-5d5d5f1a6aac' })
  @IsOptional()
  @IsUUID('4')
  public schemaTypeId?: string;

  //
  // Properties
  //
  @ApiProperty()
  @Length(3, 32)
  public name: string;

  @ApiProperty()
  @IsOptional()
  @Length(0, 32)
  public mapping?: string;

  @ApiProperty()
  @IsEnum(SchemaColumnTypes)
  public type: SchemaColumnTypes;

  @ApiProperty()
  @IsOptional()
  @Length(0, 160)
  public description?: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  public isStatic?: boolean;

  /**
   * Column label for forms(optional).
   */
  @ApiProperty()
  @IsOptional()
  public label?: string;

  /**
   * Column transform
   * LOWERCASE, UPPERCASE, PASCAL_CASE, CAMEL_CASE, SNAKE_CASE
   */
  @ApiProperty()
  @IsOptional()
  public transform?: string;

  /**
   * Column category for forms(optional).
   */
  @ApiProperty()
  @IsOptional()
  public category?: string;

  /**
   * Column defaultValue.
   */
  @ApiProperty()
  @IsOptional()
  public defaultValue?: any;

  /**
   * Column placeholder for forms.
   */
  @ApiProperty()
  @IsOptional()
  public placeholder?: string;

  /**
   * Column isHidden from forms.
   */
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  public isHidden?: boolean;

  /**
   * Column isVisibleInTables.
   */
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  public isVisibleInTables?: boolean;

  /**
   * Column isDisabled in forms.
   */
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  public isDisabled?: boolean;

  /**
   * Column isTitleColumn in forms.
   */
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  public isTitleColumn?: boolean;

  /**
   * Column isStatusColumn in forms.
   */
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  public isStatusColumn?: boolean;

  /**
   * the vertical position of the field
   */
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  public position?: number;

  /**
   * the horizontal position of the field
   */
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  public columnPosition?: number;


}
