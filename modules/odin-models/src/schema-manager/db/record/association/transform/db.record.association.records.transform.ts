import { Base } from '../../../../../Base';
import { SchemaAssociationEntityTransform } from '../../../../schema/association/transform/schema.association.entity.transform';
import { SchemaEntityTransform } from '../../../../schema/transform/schema.entity.transform';
import { DbRecordEntityTransform } from '../../transform/db.record.entity.transform';

export class DbRecordAssociationRecordsTransform extends Base {
  public schema: SchemaEntityTransform;
  public schemaAssociation: SchemaAssociationEntityTransform;
  public dbRecords: DbRecordEntityTransform[];
  public createdBy?: { id: string | undefined, fullName: string | undefined } | undefined;
  public lastModifiedBy?: { id: string | undefined, fullName: string | undefined } | undefined;
}
