import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { SchemaAssociationCardinalityTypes } from '../types/schema.association.cardinality.types';

export class SchemaAssociationCreateUpdateDto {

  @ApiProperty({
    description: 'The relationship between the source and target',
    example: 'ONE_TO_ONE | ONE_TO_MANY | MANY_TO_MANY',
  })
  @IsEnum(SchemaAssociationCardinalityTypes)
  public type: SchemaAssociationCardinalityTypes;

  @ApiProperty()
  @IsUUID('4')
  public childSchemaId: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  public isStatic?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  public hasColumnMappings?: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  public parentActions?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  public childActions?: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  public cascadeDeleteChildRecord?: boolean;

  /**
   * order the positioning of associations when listed
   * position.
   */
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  public position?: number;

  /**
   * Schema Entity Name (Parent)
   * dataSourcePrimary.
   */
  @ApiProperty()
  @IsString()
  @IsOptional()
  public findInSchema?: string;

  /**
   * Schema Entity Name (Child)
   * dataSourceSecondary.
   */
  @ApiProperty()
  @IsString()
  @IsOptional()
  public findInChildSchema?: string;

  /**
   * getUrl.
   */
  @ApiProperty()
  @IsString()
  @IsOptional()
  public getUrl?: string;

  /**
   * postUrl.
   */
  @ApiProperty()
  @IsString()
  @IsOptional()
  public postUrl?: string;

  /**
   * putUrl.
   */
  @ApiProperty()
  @IsString()
  @IsOptional()
  public putUrl?: string;

  /**
   * deleteUrl.
   */
  @ApiProperty()
  @IsString()
  @IsOptional()
  public deleteUrl?: string;

}
