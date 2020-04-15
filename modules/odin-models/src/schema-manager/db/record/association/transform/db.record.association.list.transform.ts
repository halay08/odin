import { DbRecordAssociationRecordsTransform } from "./db.record.association.records.transform";

export class DbRecordAssociationListTransform {
  public parentRelations: DbRecordAssociationRecordsTransform[];
  public childRelations: DbRecordAssociationRecordsTransform[];
}
