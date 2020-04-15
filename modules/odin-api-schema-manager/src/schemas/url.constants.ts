export const dbRecordUrlConstants = {
  searchUrl: `${process.env.MODULE_NAME}/v1.0/db/{entityName}/search`,
  getUrl: `${process.env.MODULE_NAME}/v1.0/db/{entityName}/{recordId}`,
  postUrl: `${process.env.MODULE_NAME}/v1.0/db/{entityName}`,
  putUrl: `${process.env.MODULE_NAME}/v1.0/db/{entityName}/{recordId}`,
  deleteUrl: `${process.env.MODULE_NAME}/v1.0/db/{entityName}/{recordId}`,
};

export const dbRecordAssociationUrlConstants = {
  getUrl: `${process.env.MODULE_NAME}/v1.0/db-associations/{dbRecordAssociationId}`,
  postUrl: `${process.env.MODULE_NAME}/v1.0/db-associations/{entityName}/{recordId}`,
  putUrl: `${process.env.MODULE_NAME}/v1.0/db-associations/{dbRecordAssociationId}`,
  deleteUrl: `${process.env.MODULE_NAME}/v1.0/db-associations/{dbRecordAssociationId}`,
  putTransferUrl: `${process.env.MODULE_NAME}/v1.0/db-associations/transfer/:transferorId/:transfereeId`,
};
