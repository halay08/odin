import { ApiProperty } from '@nestjs/swagger';
import { RelationTypeEnum } from '../types/db.record.association.constants';

export class DbRecordAssociationCreateUpdateDto {

  /**
   * The recordId you want to create a relationship with
   */
  @ApiProperty()
  public recordId: string;
  /**
   * The db record association you want to relate to if the recordId has column mappings
   * i.e adding a product to an order from a Price Book.. the relatedAssociationId is the dbRecordAssociaiontId
   * of the price book and product.
   */
  @ApiProperty()
  public relatedAssociationId?: string;
  /**
   * ODN-1352
   * @author ftruglio
   *
   * In the scenario of having an entity with a self relation you will be required to specify
   * the relation of the recordId. (PARENT or CHILD)
   */
  @ApiProperty()
  public relationType?: RelationTypeEnum;
  /**
   * Object of key value pairs.
   * If the association has column mappings enabled
   */
  @ApiProperty({ description: 'object with key value pairs' })
  public properties?: {};

}
