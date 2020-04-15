import { Base } from '../../../../../Base';

export class DbRecordAssociationEntityTransformBase extends Base {

  public id: string;
  public relatedAssociationId: string | undefined;
  public createdBy?: { id: string | undefined, fullName: string | undefined } | undefined;
  public lastModifiedBy?: { id: string | undefined, fullName: string | undefined } | undefined;

}
