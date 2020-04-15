import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { DbRecordAssociationCreateUpdateDto } from '../association/dto/db.record.association.create.update.dto';

export class DbRecordCreateUpdateDto {

  /**
   * When creating records from an External App
   */
  @IsOptional()
  @IsString()
  public externalAppName?: string;

  /**
   * When creating records from an External App
   */
  @IsOptional()
  @IsString()
  public externalId?: string;

  /**
   * context for the rag status
   * optional until we migrate to using this field
   */
  @IsOptional()
  @IsString()
  public title?: string;

  /**
   * auto-generated record number from the schema definition
   */
  @IsOptional()
  @IsString()
  public recordNumber?: string;

  /**
   * specify the moduleName:entityName for the record being created / updated
   * moduleName
   */
  @ApiProperty({ description: 'name of the module', example: 'CrmModule:Lead' })
  @IsString()
  @IsOptional()
  public entity?: string;

  /**
   * This is the schema type property which is used to flatten the data model and enhance
   * denormalization
   */
  @ApiProperty({ description: 'schema type', example: 'MASTER' })
  @IsString()
  @IsOptional()
  public type?: string;
  /**
   *
   * Schema id.
   */
  @ApiProperty({ description: 'uuidv4', example: 'fa4f29c7-6606-4d6d-8121-5d5d5f1a6aac' })
  @IsOptional()
  @IsUUID('4')
  public schemaId?: string;

  /**
   * Stage id.
   */
  @ApiProperty({ description: 'uuidv4', example: 'fa4f29c7-6606-4d6d-8121-5d5d5f1a6aac' })
  @IsOptional()
  @IsUUID('4')
  public stageId?: string;

  /**
   *
   * Organization User id.
   */
  @ApiProperty({ description: 'uuidv4', example: 'fa4f29c7-6606-4d6d-8121-5d5d5f1a6aac' })
  @IsOptional()
  @IsUUID('4')
  public ownerId?: string;

  /**
   * Object of key value pairs.
   */
  @ApiProperty({ description: 'object with key value pairs' })
  public properties?: {};

  /**
   * This will associate any records to the child or parent record being created.
   * Array of association ids
   */
  @ApiProperty()
  @IsOptional()
  public associations?: DbRecordAssociationCreateUpdateDto[];

  /**
   * Filled in when the record stage is changed
   */
  @ApiProperty()
  @IsOptional()
  public stageUpdatedAt?: Date;

  @ApiProperty()
  @IsOptional()
  public options?: {
    // this will prevent the rabbitmq event from firing
    skipCreateEvent?: boolean,
    // this will prevent the rabbitmq event from firing
    skipUpdateEvent?: boolean,
    // this will prevent the rabbitmq event from firing
    skipDeleteEvent?: boolean,
    // if the update has a notification trigger this property can allow skipping
    skipNotificationEvent?: boolean,
  }

  /**
   * This will associate any records to the existing user groups.
   * Array of association ids
   */
     @ApiProperty()
     @IsOptional()
     public groups?: string[];

}
