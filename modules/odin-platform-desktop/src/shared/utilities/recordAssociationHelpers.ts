import { IRecordAssociationsReducer } from '../../core/recordsAssociations/store/reducer';

/**
 * When you need to get a records related records
 *
 * Note: to use this helper you first need to call
 * the reducer action to get related records getAssociations()
 *
 * @param recordAssociationReducer
 * @param recordId
 * @param entityName
 * @param schemaType
 */
export function getRelatedListData(
  recordAssociationReducer: IRecordAssociationsReducer,
  recordId: string,
  entityName: string,
  schemaType: string,
) {

  const associationKey = `${recordId}_${entityName}_${schemaType}`;
  const associationObj: any = recordAssociationReducer.shortList[associationKey];

  if(associationObj && associationObj[entityName] && associationObj[entityName].dbRecords) {

    return associationObj[entityName].dbRecords;

  } else {

    return []

  }
}
