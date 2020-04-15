/**
 *
 * @param colName
 * @param entityName
 */
export const getDataIndexForRelatedRecord = (colName: string, entityName: string) => {
  return colName ? `${entityName}.dbRecords.properties.${colName}` : ''
}


export const getDataIndexForRelatedRecordField = (colName: string, entityName: string) => {
  return colName ? `${entityName}.dbRecords.${colName}` : ''
}

