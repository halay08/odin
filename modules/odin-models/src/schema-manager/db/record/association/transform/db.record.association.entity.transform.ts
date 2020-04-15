import { DbRecordAssociationEntity } from '../db.record.association.entity';
import { DbRecordAssociationEntityTransformBase } from './db.record.association.entity.transform.base';


export class DbRecordAssociationEntityTransform extends DbRecordAssociationEntityTransformBase {

  public static transform(dbRecordAssociation: DbRecordAssociationEntity): DbRecordAssociationEntityTransform {
    return {
      id: dbRecordAssociation.id,
      relatedAssociationId: dbRecordAssociation.relatedAssociationId,
      createdAt: dbRecordAssociation.createdAt,
      updatedAt: dbRecordAssociation.updatedAt,
    }
  }
}


